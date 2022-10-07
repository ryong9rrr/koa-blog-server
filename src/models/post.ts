import { Schema, model } from 'mongoose'

interface IPost {
  title: string
  body: string
  tags: string[]
  publishedDate: Date
}

const PostSchema = new Schema<IPost>({
  title: String,
  body: String,
  tags: [String],
  publishedDate: {
    type: Date,
    default: Date.now
  }
})

const Post = model<IPost>('Post', PostSchema)
export default Post
