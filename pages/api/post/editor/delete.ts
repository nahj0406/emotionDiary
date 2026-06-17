// pages/api/editor/delete-images.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from '@/lib/external_storage/cloudinary'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: '메서드가 일치하지 않습니다.',
    })
  }

  try {
    const { publicIds } = req.body as {
      publicIds?: string[]
    }

    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(200).json({
        message: '삭제할 이미지가 없습니다.',
      })
    }

    await Promise.all(
      publicIds.map(publicId =>
        cloudinary.uploader.destroy(publicId)
      )
    )

    return res.status(200).json({
      message: '이미지 삭제 완료',
    })
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: '이미지 삭제 실패',
    })
  }
}