import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'


// TODO: Implement the fileStogare logic

export class AttachmentUtils {

  constructor(
    private readonly logger = createLogger('attachmentUtils'),
    private readonly s3 = new XAWS.S3({ 
      signatureVersion: 'v4' }),
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
  ) {}

  getAttachmentUrl(todoId: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  }

  async createAttachmentPresignedUrl(todoId: string): Promise<string> {
    this.logger.info('getting presigned url for', todoId)
    const uploadUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
    return uploadUrl

  }

}