import type { Request, Response } from 'express'
import { validationResult } from 'express-validator'

exports.handle = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const { message } = req.body
    return res.status(200).send({ message })
  } catch (error) {
    return res.status(500).send({ error })
  }
}
