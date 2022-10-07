import { Model, Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'

interface IUser {
  username: string
  hashedPassword: string
}

interface IUserMethods {
  setPassword(password: string): Promise<void>
  checkPassword(password: string): Promise<boolean>
  serialize(): string
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByUsername(username: string): IUser
}

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true }
})

UserSchema.methods.setPassword = async function (password: string) {
  const hash = await bcrypt.hash(password, 10)
  this.hashedPassword = hash
}

UserSchema.methods.checkPassword = async function (password: string) {
  const result = await bcrypt.compare(password, this.hashedPassword)
  return result
}

UserSchema.methods.serialize = function () {
  const data = this.toJSON()
  delete data.hashedPassword
  return data
}

UserSchema.statics.findByUsername = function (username: string) {
  return this.findOne({ username })
}

const User = model<IUser, UserModel>('User', UserSchema)
export default User
