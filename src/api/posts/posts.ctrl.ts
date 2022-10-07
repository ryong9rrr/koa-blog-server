import { Context } from 'koa'
import Post from '../../models/post'

export const write = async (ctx: Context) => {
  if (!ctx.request.body) {
    ctx.throw(400)
  }
  try {
    const { title, body, tags } = ctx.request.body
    const post = new Post({
      title,
      body,
      tags
    })
    await post.save()
    ctx.body = post
  } catch (e) {
    ctx.throw(500, `${e}`)
  }
}

export const list = async (ctx: Context) => {
  try {
    const posts = await Post.find().exec()
    ctx.body = posts
  } catch (e) {
    ctx.throw(500, `${e}`)
  }
}

export const read = async (ctx: Context) => {
  const { id } = ctx.params
  try {
    const post = await Post.findById(id).exec()
    if (!post) {
      ctx.status = 404
      return
    }
    ctx.body = post
  } catch (e) {
    ctx.throw(500, `${e}`)
  }
}

export const remove = async (ctx: Context) => {
  const { id } = ctx.params
  try {
    const post = await Post.findByIdAndRemove(id).exec()
    if (!post) {
      ctx.status = 404
      return
    }
    ctx.status = 204
  } catch (e) {
    ctx.throw(500, `${e}`)
  }
}

export const update = async (ctx: Context) => {
  const { id } = ctx.params
  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true // false라면 업데이트 되기 전의 데이터를 반환
    }).exec()
    if (!post) {
      ctx.status = 404
      return
    }
    ctx.body = post
  } catch (e) {
    ctx.throw(500, `${e}`)
  }
}
