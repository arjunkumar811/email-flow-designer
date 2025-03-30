import FlowChart from "../models/FlowChart.js";
import EmailJob from "../models/EmailJob.js";
import agenda from "../config/agenda.js";

// Create a new flowchart
export async function createFlowChart(req, res) {
  try {
    const { name, flowData } = req.body;

    const flowChart = new FlowChart({
      name,
      flowData,
      user: req.user._id,
    });

    await flowChart.save();

    res.status(201).json(flowChart);
  } catch (error) {
    console.error("Create flowchart error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Get all flowcharts for a user
export async function getFlowCharts(req, res) {
  try {
    const flowCharts = await FlowChart.find({ user: req.user._id }).sort({
      updatedAt: -1,
    });

    res.json(flowCharts);
  } catch (error) {
    console.error("Get flowcharts error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Get a specific flowchart
export async function getFlowChart(req, res) {
  try {
    const flowChart = await FlowChart.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!flowChart) {
      return res.status(404).json({ message: "Flowchart not found" });
    }

    res.json(flowChart);
  } catch (error) {
    console.error("Get flowchart error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Update a flowchart
export async function updateFlowChart(req, res) {
  try {
    const { name, flowData } = req.body;

    const flowChart = await FlowChart.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        name,
        flowData,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!flowChart) {
      return res.status(404).json({ message: "Flowchart not found" });
    }

    // Process the flowchart to schedule emails
    await processFlowChart(flowChart);

    res.json(flowChart);
  } catch (error) {
    console.error("Update flowchart error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Delete a flowchart
export async function deleteFlowChart(req, res) {
  try {
    const flowChart = await FlowChart.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!flowChart) {
      return res.status(404).json({ message: "Flowchart not found" });
    }

    // Cancel any scheduled emails for this flowchart
    await EmailJob.deleteMany({ flowChart: flowChart._id });

    res.json({ message: "Flowchart deleted successfully" });
  } catch (error) {
    console.error("Delete flowchart error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Process flowchart and schedule emails
const processFlowChart = async (flowChart) => {
  try {
    const { flowData } = flowChart;
    const { nodes, edges } = flowData;

    // Get all email nodes
    const emailNodes = nodes.filter((node) => node.type === "emailNode");

    // For each email node, determine if it needs to be scheduled
    for (const emailNode of emailNodes) {
      // Find incoming edges to this node
      const incomingEdges = edges.filter(
        (edge) => edge.target === emailNode.id
      );

      if (incomingEdges.length === 0) {
        // This is a starting node, schedule immediately
        await scheduleEmail(emailNode, 0, flowChart._id);
      } else {
        // For each incoming edge, follow the path back to determine delay
        for (const incomingEdge of incomingEdges) {
          let totalDelay = 0;
          let currentNodeId = incomingEdge.source;

          // Traverse backwards to find delay nodes
          while (currentNodeId) {
            const currentNode = nodes.find((node) => node.id === currentNodeId);

            if (!currentNode) break;

            if (currentNode.type === "delayNode") {
              // Add the delay from this node
              totalDelay += currentNode.data.delayHours || 0;
            }

            // Find the incoming edge to the current node
            const prevEdge = edges.find(
              (edge) => edge.target === currentNodeId
            );
            currentNodeId = prevEdge ? prevEdge.source : null;
          }

          // Schedule the email with the calculated delay
          await scheduleEmail(emailNode, totalDelay, flowChart._id);
        }
      }
    }
  } catch (error) {
    console.error("Process flowchart error:", error);
    throw error;
  }
};

// Schedule an email
const scheduleEmail = async (emailNode, delayHours, flowChartId) => {
  try {
    const { to, subject, body } = emailNode.data;

    // Calculate scheduled time
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + delayHours);

    // Create email job record
    const emailJob = new EmailJob({
      to,
      subject,
      body,
      scheduledTime,
      flowChart: flowChartId,
      nodeId: emailNode.id,
    });

    await emailJob.save();

    // Schedule with Agenda
    schedule(scheduledTime, "send email", {
      to,
      subject,
      body,
      emailJobId: emailJob._id,
    });

    return emailJob;
  } catch (error) {
    console.error("Schedule email error:", error);
    throw error;
  }
};
