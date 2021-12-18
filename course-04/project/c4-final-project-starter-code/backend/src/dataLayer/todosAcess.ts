import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the dataLayer logic
export class TodosAccess {

  constructor(
    private readonly logger = createLogger('dataLayer'),
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndex = process.env.TODOS_USERID_INDEX
  ){}

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    this.logger.info('Getting todos for user', userId)

    const result = await this.docClient.query({ 
      TableName: this.todosTable,
      IndexName: this.userIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(newTodo: TodoItem): Promise<TodoItem> {
    this.logger.info('creating new todo', newTodo)
    await this.docClient.put({
      TableName: this.todosTable,
      Item: {
        ...newTodo
      },
    }).promise()

    return newTodo
  }

  async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate) {
    this.logger.info('updating todo', {userId: userId, todoId: todoId})
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: `set name = :name, dueDate = :dueDate, done = :done`,
      ExpressionAttributeValues: {
        ":name": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done,
      },
    }).promise()
  }

  async daleteTodo(userId: string, todoId: string) {
    this.logger.info('deleting todo', { userId: userId, todoId: todoId })
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }).promise()
  }

  async updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string) {
    this.logger.info('updating attachment url', { userId: userId, todoId: todoId, attachmentUrl: attachmentUrl})

    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: `set attachmentUrl = :attachmentUrl`,
      ExpressionAttributeValues: {
        ":attachmentUrl": attachmentUrl
      },
    }).promise()
  }

  async todoExists(userId: string, todoId: string): Promise<boolean>{
  const result = await this.docClient
    .get({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    })
    .promise()

  
  return !!result.Item
}

  

}