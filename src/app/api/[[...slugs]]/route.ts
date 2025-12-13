import { Elysia } from "elysia"

const rooms = new Elysia({ prefix: "/room" })
  .post("/create", async () => {
    console.log("CREATE ROOM!!!")
  })


const app = new Elysia({ prefix: "/api" }).use(rooms)

export const GET = app.fetch
export const POST = app.fetch

export type App = typeof app