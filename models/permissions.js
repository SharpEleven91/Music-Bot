const mongoose = require("mongoose");

const permissionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userName: String,
    userID: String,
    permissionLevel: Number
});

module.exports = mongoose.model("Permissions", permissionSchema);