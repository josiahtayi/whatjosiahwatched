import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default async function HomePage() {
  const posts = await getAllPosts();
  const fridayPick = posts.find((post) => post.isFridayPick);

  return (
      <main className="min-h-screen bg-black text-white p-6">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight">What Josiah Saw</h1>
          <p className="text-gray-400 mt-2 italic">A horror movie journal — one scream at a time.</p>
        </header>

        {fridayPick && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">👻 Friday Night Fright</h2>
              <div className="bg-zinc-900 p-4 rounded-lg shadow-md">
                <Link href={`/blog/${fridayPick.slug}`} className="hover:underline">
                  <h3 className="text-xl font-bold">{fridayPick.title} ({fridayPick.year})</h3>
                </Link>
                <p className="text-sm text-gray-400">Rating: {fridayPick.rating}/10</p>
              </div>
            </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold mb-4">🩸 Recent Posts</h2>
          <ul className="space-y-4">
            {posts.map((post) => (
                <li key={post.slug} className="bg-zinc-800 p-4 rounded-lg hover:bg-zinc-700 transition">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h3 className="text-lg font-bold">{post.title} ({post.year})</h3>
                    <p className="text-sm text-gray-400">Rating: {post.rating}/10</p>
                  </Link>
                </li>
            ))}
          </ul>
        </section>
      </main>
  );
}
