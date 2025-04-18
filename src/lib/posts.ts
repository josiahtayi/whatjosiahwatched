import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/content');

export async function getPostBySlug(slug: string) {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const { data, content } = matter(fileContents);
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    return {
        slug,
        metadata: data,
        contentHtml,
    };
}

export function getAllPostSlugs() {
    return fs.readdirSync(postsDirectory).map((fileName) => {
        return {
            slug: fileName.replace(/\.md$/, ''),
        };
    });
}
export async function getAllPosts() {
    const fileNames = fs.readdirSync(postsDirectory);

    const allPosts = await Promise.all(
        fileNames.map(async (fileName) => {
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(fileContents);

            return {
                slug,
                ...data,
            };
        })
    );

    return allPosts.sort((a, b) => b.year - a.year);
}
