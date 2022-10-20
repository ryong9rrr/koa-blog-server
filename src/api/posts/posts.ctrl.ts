import { Middleware } from '@koa/router'
import { Context } from 'koa'
import mongoose from 'mongoose'
import Joi from 'joi'
import sanitizeHtml, { IOptions } from 'sanitize-html'
import Post from '../../models/post'

type PostRequestBody = {
  title: string
  body: string
  tags: string[]
}

const { ObjectId } = mongoose.Types

const sanitizeOption: IOptions = {
  allowedTags: ['h1', 'h2', 'b', 'i', 'u', 's', 'p', 'ul', 'ol', 'li', 'blockquote', 'a', 'img'],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src'],
    li: ['class']
  },
  allowedSchemes: ['data', 'http']
}

export const getPostById: Middleware = async (ctx, next) => {
  const { id } = ctx.params
  if (!ObjectId.isValid(id)) {
    ctx.status = 400
    return
  }
  try {
    const post = await Post.findById(id)
    if (!post) {
      ctx.status = 404
      return
    }
    ctx.state.post = post
    return next()
  } catch (e) {
    ctx.throw(500, `${e}`)
  }
}

export const checkOwnPost: Middleware = (ctx, next) => {
  const { user, post } = ctx.state
  // MongoDB에서 조회한 데이터의 id값을 문자열과 비교할 때는 반드시 .toString()을 해줘야함.
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403
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
  const { title, body, tags } = ctx.request.body as PostRequestBody
  const post = new Post({
    title,
    body: sanitizeHtml(body, sanitizeOption),
    tags,
    user: ctx.state.user
  })
  try {
    await post.save()
    ctx.body = post
  } catch (e) {
    ctx.throw(500, `${e}`)
  }
}

// body가 html태그로 들어오기 때문에 직접 자르지 않고 sanitizeHtml 라이브러리를 사용한 후 자름
const removeHtmlAndShorten = (body: string) => {
  const filtered = sanitizeHtml(body, {
    allowedTags: []
  })
  return filtered.length < 200 ? filtered : `${filtered.slice(0, 200)}...`
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

  const { tag, username } = ctx.query
  const query = {
    ...(username ? { 'user.username': username } : {}),
    ...(tag ? { tags: tag } : {})
  }

  try {
    // 가장 최근 작성된 포스트부터 불러주도록 내림차순 정렬, 처음에는 10개만 보여주기
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10) // pagination
      .lean() // 데이터를 처음부터 JSON 형태로 바꿔주는 메서드
      .exec()
    const postCount = await Post.countDocuments(query).exec()
    // 클라이언트 편의를 위해 마지막 페이지를 제공해줍니다. 이 값은 HTTP header로 전송됨.
    ctx.set('Last-Page', Math.ceil(postCount / 10).toString())
    ctx.body = posts.map((post) => ({
      ...post,
      body: removeHtmlAndShorten(post.body)
    }))
  } catch (e) {
    ctx.throw(500, `${e}`)
  }
}

export const read = async (ctx: Context) => {
  ctx.body = ctx.state.post
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
  const nextData = { ...ctx.request.body }
  if (nextData.body) {
    nextData.body = sanitizeHtml(nextData.body as string, sanitizeOption)
  }
  try {
    const post = await Post.findByIdAndUpdate(id, nextData, {
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
