import { getPostBySlug } from '@/lib/posts';
import { notFound } from 'next/navigation';

interface Props {
    params: { slug: string };
}

export default async function BlogPost({ params }: Props) {
    const post = await getPostBySlug(params.slug);

    if (!post) return notFound();

    return (
        <main className="max-w-2xl mx-auto p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{post.metadata.title}</h1>
            <p className="text-gray-400 mb-4">
                {post.metadata.year} · Rating: {post.metadata.rating}/10
            </p>
            <article
                className="prose prose-invert"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
        </main>
    );
}
