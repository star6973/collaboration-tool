const mongoose = require('mongoose')

// 사용자 정보 스키마 정의
const UsersSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true },
		first_name: { type: String },
		last_name: { type: String },
		password: { type: String, required: true },
		color: { type: String, required: true, default: '#000000' }
	},
	{
		timestamps: true
	}
)

// Create new document
UsersSchema.statics.create = function(payload) {
	const todo = new this(payload)
	return todo.save()
}

// Find all
UsersSchema.statics.findAll = function() {
	return this.find({})
}

// Find one by email
UsersSchema.statics.findOneByEmail = function(email) {
	return this.findOne({ email })
}

// Update by email
UsersSchema.statics.updateByEmail = function(email, payload) {
	// { new: true }: return the modified document rather than the original. Defaults to false.
	return this.findOneAndUpdate({ email }, payload, { new: true })
}

// Delete by email
UsersSchema.statics.deleteByUrl = function(email) {
	return this.remove({ email })
}

module.exports = mongoose.model('Users', UsersSchema, 'users')
