const mongoose = require('mongoose');

const treeSchema = new mongoose.Schema({
    root: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    nodes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        children: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Tree = mongoose.model('Tree', treeSchema);

module.exports = Tree;