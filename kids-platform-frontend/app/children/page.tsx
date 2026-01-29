import { redirect } from "next/navigation";

export default function ChildrenIndexPage() {
  redirect("/parent");
}
