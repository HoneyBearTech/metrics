//Imports
import { faker } from "@faker-js/faker"
import fs from "node:fs"
import mock from "../../mocks/api/axios/get/stackoverflow.mjs"

//Same urls as the ones requested by the plugin, with its filters (see source/plugins/stackoverflow/index.mjs)
const source = fs.readFileSync(new URL("../../../source/plugins/stackoverflow/index.mjs", import.meta.url), "utf8")
const user = 1234
const limit = 2
const base = "https://api.stackexchange.com/2.2"
const filters = JSON.parse(source.match(/const filters = (?<filters>[{].*?[}])\n/s).groups.filters.replace(/(\w+):/g, '"$1":'))
const urls = {
  account: `${base}/users/${user}?site=stackoverflow&filter=${filters.user}`,
  comments: `${base}/users/${user}/comments?site=stackoverflow&filter=total`,
  answers: `${base}/users/${user}/answers?site=stackoverflow&pagesize=${limit}&filter=${filters.answer}&sort=votes&order=desc`,
  answersRecent: `${base}/users/${user}/answers?site=stackoverflow&pagesize=${limit}&filter=${filters.answer}&sort=activity&order=desc`,
  questions: `${base}/users/${user}/questions?site=stackoverflow&pagesize=${limit}&filter=${filters.question}&sort=votes&order=desc`,
  questionsRecent: `${base}/users/${user}/questions?site=stackoverflow&pagesize=${limit}&filter=${filters.question}&sort=activity&order=desc`,
  relatedQuestions: `${base}/questions/1;2?site=stackoverflow&filter=${filters.question}`,
  relatedAnswers: `${base}/answers/1;2?site=stackoverflow&filter=${filters.answer}`,
}

//Fields read by the plugin
const fields = {
  answer: ["body_markdown", "score", "up_vote_count", "down_vote_count", "is_accepted", "comment_count", "creation_date", "owner", "link", "answer_id", "question_id"],
  question: ["title", "body_markdown", "score", "up_vote_count", "down_vote_count", "favorite_count", "tags", "is_answered", "answer_count", "comment_count", "view_count", "creation_date", "owner", "link", "question_id", "accepted_answer_id"],
}

//Ask the stand-in, like the mocked axios does
const ask = url => mock({faker, url, options: undefined})
const missing = (items, names) => [...new Set(items.flatMap(item => names.filter(name => !(name in item) || item[name] === undefined || item[name] === null)))]
const types = object => Object.fromEntries(Object.entries(object).map(([key, value]) => [key, typeof value === "object" ? types(value) : typeof value]))
const list = (url, names) => {
  const result = ask(url)
  return {status: result?.status ?? null, items: result?.data?.items?.length ?? null, fields: result ? missing(result.data.items, names) : null}
}

export function account() {
  const result = ask(urls.account)
  const {reputation, badge_counts, answer_count, question_count, view_count} = result?.data?.items?.[0] ?? {}
  return {status: result?.status ?? null, items: result?.data?.items?.length ?? null, user: types({reputation, badge_counts, answer_count, question_count, view_count})}
}

export function unfiltered() {
  const result = ask(`${base}/users/${user}?site=stackoverflow`)
  return {status: result?.status ?? null, items: result?.data?.items?.length ?? null}
}

export function comments() {
  const result = ask(urls.comments)
  return {status: result?.status ?? null, total: typeof result?.data?.total}
}

export function answers() {
  const [top, recent] = [list(urls.answers, fields.answer), list(urls.answersRecent, fields.answer)]
  const merged = {status: top.status === recent.status ? top.status : null, items: Math.min(top.items, recent.items), fields: [...top.fields, ...recent.fields]}
  return {...merged, related: list(urls.relatedQuestions, fields.question)}
}

export function questions() {
  const [top, recent] = [list(urls.questions, fields.question), list(urls.questionsRecent, fields.question)]
  const merged = {status: top.status === recent.status ? top.status : null, items: Math.min(top.items, recent.items), fields: [...top.fields, ...recent.fields]}
  return {...merged, related: list(urls.relatedAnswers, fields.answer)}
}

//The user account request must be answered by the user account data only, not by the comments, answers or questions ones
export function distinct() {
  const account = ask(urls.account)?.data?.items?.[0]
  const comments = ask(urls.comments)?.data
  return {account: Boolean(account && "reputation" in account && !("question_id" in account)), comments: Boolean(comments && "total" in comments && !("items" in comments))}
}
