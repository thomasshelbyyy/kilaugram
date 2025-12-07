import { searchUser } from "@/lib/firebase/service";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { keyword } = await req.json();
  console.log({ keyword });

  try {
    const res = await searchUser(keyword);
    // return NextResponse.json({postId, username, userId, profilePictureUrl})

    // return NextResponse.json({status: res.status ? 200 : 400, message: res.message})
    if (res.status) {
      return NextResponse.json({ status: 200, data: res.data });
    } else {
      return NextResponse.json({ status: 400, message: res.message });
    }
    // return NextResponse.json({postId: res})
  } catch (error) {
    return NextResponse.json({ status: 400, message: error.message });
  }
}
