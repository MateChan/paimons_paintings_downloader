import ky from "ky"
import { extname, join } from "@std/path"

type ResponseBody = {
  data: {
    list: [{
      id: string
      title: string
      details: [{
        id: string
        url: string
      }]
    }]
  }
}

async function main() {
  const baseSaveDir = "paimons_paintings"

  const res = await ky<ResponseBody>(
    "https://bbs-api-os.hoyolab.com/community/pendant/wapi/pendant/list",
    {
      searchParams: {
        last_id: 0,
        page_size: 999,
        series_id: 70,
        type: 3,
      },
    },
  ).json()

  res.data.list.forEach(async ({ title, details }) => {
    const volume = title.match(/Paimon's Paintings\D*(\d+)/)?.at(1)
    if (!volume) return

    const saveDir = join(baseSaveDir, volume.padStart(2, "0"))
    await Deno.mkdir(saveDir, { recursive: true })

    details.forEach(async ({ url, id }, i) => {
      const emojiUrl = url.split("?")[0]
      const fileName = id + extname(emojiUrl)
      const savePath = join(saveDir, fileName)

      const blob = await ky(emojiUrl).blob()
      Deno.writeFile(savePath, blob.stream())
    })
  })
}

import.meta.main && main()
