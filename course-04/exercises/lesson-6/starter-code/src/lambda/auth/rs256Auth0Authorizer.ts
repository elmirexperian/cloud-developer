
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJGBZc7zc6uVPVMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1yamNjamxiMC5ldS5hdXRoMC5jb20wHhcNMjExMjE0MTgxOTA1WhcN
MzUwODIzMTgxOTA1WjAkMSIwIAYDVQQDExlkZXYtcmpjY2psYjAuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArsQ9ukeMqt8QeS4s
DwUZ+EILETGoxyRgcEmf+Of3UToUj9fdLGpulE6FzIuI3M3WgRpEa5irYd3bqGj+
Kj7KBSAMmIajx+zY6zAM2xMSLCLjgGcYh6oQB4HeynEP5mTLETU94oM2c16yvGOq
Ka38494J0XtzYLinEBgpkeXyCdJc9Pcz+3xrKKJEibGu37IGOR6kbdIdAdcaUO/V
BLZc/LWXvbiT5w8jWHgOxih8bOBvrzxWeh0QZMxXOPn9WwXB1vIJB958elxF+cF4
JmmDP057z3ZNBhb304RWd7meSFjXM3FlXMw4KRJS+8ddKUENLH9JvvkOxFRCp8P9
5+QJfQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRbMgitDbFk
1445Si4EpSWwNTu4rjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AFtdSRCaCeUHK/6soFY+OYxu5XLURev1MddSnc2d054OAVjcF0AnECIaf1ACD7HP
rNqloKXB4QbfzMnUzBgMDZ4xinTY6e1DnXnwp4ImDH0XUel+RWaV/8rbNuv24fCA
07mYnqrETPp9LTEeNA6qtCMB8+XkqtQy52Xtwp/iS5Nc9SkVJbMiez7r0jCH1kQN
htqQyNrlhVfg0kYTStwzzH1uB3P+9kiLURysd3RQhK1O2fmknPRZSt1O4OSlmo1u
yVV3s3CEHvADquBb58IeAP3D1qOVnuKuAvlIMNquoqg8WJoxl5F2GU2qakEyF21d
xT0oDW7gqG9aLJopyavjor8=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
