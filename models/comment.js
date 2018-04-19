var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comment: String,
  created: { type: Date, default: Date.now}
});

module.exports = mongoose.model("Comment", commentSchema);