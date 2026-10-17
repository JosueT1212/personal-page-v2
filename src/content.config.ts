import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: 'src/content/posts' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    status: z.enum(['draft', 'in-progress', 'notes', 'published']),
    date: z.coerce.date(),
  }),
});

const books = defineCollection({
  loader: file('src/data/books.json'),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    category: z.enum(['mathematics', 'chess', 'beyond']),
    status: z.enum(['reading', 'read']),
    cover: z.string().optional(),
    motif: z.object({ name: z.string(), seed: z.number().optional() }),
  }),
});

const openQuestions = defineCollection({
  loader: file('src/data/open-questions.json'),
  schema: z
    .object({
      title: z.string(),
      status: z.enum(['curious', 'reading', 'working', 'understood']),
      notes: z.string().optional(),
      link: z.string().optional(),
      post: z.string().optional(),
    })
    .refine(q => q.status !== 'understood' || !!q.post, {
      message: 'post is required when status is understood',
      path: ['post'],
    }),
});

const gallery = defineCollection({
  loader: file('src/data/gallery.json'),
  schema: z.object({
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
    date: z.string().optional(),
  }),
});

export const collections = { posts, books, openQuestions, gallery };
