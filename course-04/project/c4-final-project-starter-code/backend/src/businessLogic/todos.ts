import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../dataLayer/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodosForUser(userId)
}

export async function createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {

  const todoId = uuid.v4()
  const todo: TodoItem = {
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    ...newTodo,
    done: false
  }
  return await todosAccess.createTodo(todo) 
}

export async function updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest) {

  // const todo: TodoItem = {
  //   userId: userId,
  //   todoId: todoId,
  //   createdAt: new Date().toISOString(),
  //   ...updatedTodo
  // }
  const todoExist = await todosAccess.todoExists(userId, todoId)
  if (!todoExist) {
    throw new createError.NotFound()
  }

  return todosAccess.updateTodo(userId, todoId, updatedTodo)
}

export async function deleteTodo(userId: string, todoId: string) {

  const todoExist = await todosAccess.todoExists(userId, todoId)
  if (!todoExist) {
    throw new createError.NotFound()
  }

  return todosAccess.daleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string>{

  //  exist
  const todoExist = await todosAccess.todoExists(userId, todoId)
  if (!todoExist) {
    throw new createError.NotFound()
  }
  
  // attachmentUtils generate presigned
  const uploadUrl = await attachmentUtils.createAttachmentPresignedUrl(todoId)
  // todoAccess update url
  const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
  await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)

  return uploadUrl
}