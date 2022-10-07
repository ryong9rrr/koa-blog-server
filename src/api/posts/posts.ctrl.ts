import { Middleware } from '@koa/router'
import { Context } from 'koa'
import mongoose from 'mongoose'
import Joi from 'joi'
import Post from '../../models/post'

const { ObjectId } = mongoose.Types

export const checkObjectId: Middleware = (ctx, next) => {
  const { id } = ctx.params
  if (!ObjectId.isValid(id)) {
    ctx.status = 400
    return
  }
  return next()
}

export const write = async (ctx: Context) => {
  // 필드 검증
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required()
  })
  const result = schema.validate(ctx.request.body)
  if (result.error) {
    ctx.status = 400
    ctx.body = result.error
    return
  }
  const { title, body, tags } = ctx.request.body!
  const post = new Post({
    title,
    body,
    tags
  })
  try {
    await post.save()
    ctx.body = post
  } catch (e) {
    ctx.throw(500, `${e}`)
  }
}

export const list = async (ctx: Context) => {
  // pagination
  // 쿼리가 배열로 들어오면 잘못된 요청
  if (ctx.query.page && Array.isArray(ctx.query.page)) {
    ctx.status = 400
    return
  }
  // 쿼리가 없으면 기본값은 1
  const page = parseInt(ctx.query.page || '1', 10)
  if (page < 1) {
    ctx.status = 400
    return
  }

  try {
    // 가장 최근 작성된 포스트부터 불러주도록 내림차순 정렬, 처음에는 10개만 보여주기
    const posts = await Post.find()
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10) // pagination
      .exec()
    const postCount = await Post.countDocuments().exec()
    // 클라이언트 편의를 위해 마지막 페이지를 제공해줍니다. 이 값은 HTTP header로 전송됨.
    ctx.set('Last-Page', Math.ceil(postCount / 10).toString())
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
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string())
  })

  const result = schema.validate(ctx.request.body)
  if (result.error) {
    ctx.status = 400
    ctx.body = result.error
    return
  }
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
