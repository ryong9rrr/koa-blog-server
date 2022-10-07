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
      .lean() // 데이터를 처음부터 JSON 형태로 바꿔주는 메서드
      .exec()
    const postCount = await Post.countDocuments().exec()
    // 클라이언트 편의를 위해 마지막 페이지를 제공해줍니다. 이 값은 HTTP header로 전송됨.
    ctx.set('Last-Page', Math.ceil(postCount / 10).toString())
    /*
    - 길이가 200자가 넘으면 문자열 뒤에 ...을 붙여서 문자열을 제한합니다.
    - 위에서 lean() 함수를 사용하지 않는다면 코드는 아래와 같다.
    ctx.body = posts
      .map((post) => post.toJSON())
      .map((post) => ({
        ...post,
        body: post.body && post.body.length > 200 ? `${post.body!.slice(0, 200)}...` : post.body
      }))
    */
    ctx.body = posts.map((post) => ({
      ...post,
      body: post.body && post.body.length > 200 ? `${post.body!.slice(0, 200)}...` : post.body
    }))
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
