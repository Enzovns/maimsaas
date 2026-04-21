import { readFile, readdir } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { LogoLink } from "@/components/LogoLink";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "content/blog");
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  return files.filter((f) => f.endsWith(".mdx")).map((f) => ({ slug: f.replace(".mdx", "") }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), "content/blog", `${params.slug}.mdx`);
  let content: string;
  try {
    content = await readFile(filePath, "utf-8");
  } catch {
    notFound();
  }

  const { data, content: mdxContent } = matter(content);

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <LogoLink />
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
        </div>
      </nav>

      <article className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
        <Link href="/blog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={14} />
          Back to blog
        </Link>

        <p className="text-xs text-gray-400 mb-3">
          {new Date(data.date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })} · {data.author}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">{data.title}</h1>

        <div className="prose prose-gray prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-a:text-yellow-600 prose-a:no-underline hover:prose-a:underline">
          <MDXRemote source={mdxContent} />
        </div>
      </article>
    </div>
  );
}
