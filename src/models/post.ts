import { Schema, model, Types } from 'mongoose'

interface IUser {
  _id: Types.ObjectId
  username: string
}

interface IPost {
  title: string
  body: string
  tags: string[]
  publishedDate: Date
  user: IUser
}

const PostSchema = new Schema<IPost>({
  title: String,
  body: String,
  tags: [String],
  publishedDate: {
    type: Date,
    default: Date.now
  },
  user: {
    _id: Types.ObjectId,
    username: String
  }
})

const Post = model<IPost>('Post', PostSchema)
export default Post
