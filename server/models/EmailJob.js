import { Schema, model } from "mongoose";

const emailJobSchema = new Schema({
  to: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  flowChart: {
    type: Schema.Types.ObjectId,
    ref: "FlowChart",
  },
  nodeId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["scheduled", "sent", "failed"],
    default: "scheduled",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("EmailJob", emailJobSchema);
