import { readdir, readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { LogoLink } from "@/components/LogoLink";
import { ArrowRight } from "lucide-react";

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
}

async function getPosts(): Promise<PostMeta[]> {
  const dir = path.join(process.cwd(), "content/blog");
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (file) => {
        const content = await readFile(path.join(dir, file), "utf-8");
        const { data } = matter(content);
        return {
          slug: file.replace(".mdx", ""),
          title: data.title ?? "Untitled",
          date: data.date ?? "",
          author: data.author ?? "MineApply Team",
          excerpt: data.excerpt ?? "",
        } as PostMeta;
      })
  );
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <LogoLink />
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">MineApply Blog</h1>
        <p className="text-gray-500 mb-10">Tips, guides, and updates for Australian mining job seekers.</p>

        {posts.length === 0 ? (
          <p className="text-gray-400">No posts yet.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 hover:border-yellow-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(post.date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })} · {post.author}
                    </p>
                    <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-yellow-500 flex-shrink-0 mt-1 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
