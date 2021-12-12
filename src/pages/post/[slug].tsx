import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import PrismicDOM from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Button from '../../components/ExitButton';

import PostComponet from '../../components/Post/';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
  format_last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  previewRef: boolean;
  nextPost: {
    data: {
      title: string;
    },
    uid: string;
  }
  prevPost: {
    data: {
      title: string;
    },
    uid: string;
  }
}

export default function Post({ post, previewRef, nextPost, prevPost, }: PostProps) {
  const router = useRouter();

  const time = post?.data.content.reduce((sumTotal, content) => {
    const textTime = PrismicDOM.RichText.asText(content.body).split(' ').length;
    return Math.ceil(sumTotal + textTime / 200);

  }, 0);

  if (router.isFallback) {
    return (
      <div className={commonStyles.loadingContainer}>
        <span className={commonStyles.loading}>Carregando...</span>
      </div>
    )
  }

  return (
    <>

      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>
      <main className={styles.main}>
        <article className={commonStyles.section}>
          <div className={commonStyles.main}>
            <div className={commonStyles.container}>
              <h1 className={styles.title}>{post.data.title}</h1>
              <div className={styles.info}>
                <span>
                  <FiCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </span>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
                <span>
                  <FiClock />
                  {time} min
                </span>
                <div className={styles.d}>
                  <time>
                    {post.format_last_publication_date}
                  </time>
                </div>
              </div>
              <PostComponet content={post.data.content} />
              <hr className={styles.divider} />
              <div className={styles.navigation}>
                {prevPost &&
                  <div className={styles.previous}>
                    <Link href={`/post/${prevPost.uid}`}>
                      <a>
                        <h3>{prevPost.data.title}</h3>
                        <span className={styles.label}>Post anterior</span>
                      </a>
                    </Link>
                  </div>
                }
                {nextPost &&
                  <div className={styles.next}>
                    <Link href={`/post/${nextPost.uid}`}>
                      <a>
                        <h3>{nextPost.data.title}</h3>
                        <span className={styles.label}>Próximo post</span>
                      </a>
                    </Link>
                  </div>
                }
              </div>
              <Comments />
            </div>
          </div>
        </article>
      </main>
      <Button router={previewRef} />
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { slug: 'como-utilizar-hooks' } },
      { params: { slug: 'criando-um-app-cra-do-zero' } },
    ],
    fallback: true
  }
}


export async function getStaticProps({ params, previewData }) {
  const previewRef = previewData ? previewData.ref : null
  const refOption = previewRef ? { ref: previewRef } : null
  const prismic = getPrismicClient();
  const { slug } = params
  const res = (await prismic.getByUID('p', slug, refOption)) || {} as any

  const nextResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'p'),
    {
      pageSize: 1,
      after: res?.id,
      orderings: '[document.first_publication_date desc]',
    },
  )
  const prevResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'p'),
    {
      pageSize: 1,
      after: res?.id,
      orderings: '[document.first_publication_date]',
    },
  )
  const nextPost = nextResponse?.results[0] || null
  const prevPost = prevResponse?.results[0] || null

  const format_last_publication_date =
    format(
      new Date(res.last_publication_date),
      `'*editado em '` + 'dd MMM yyyy' + `' ás '` + 'HH:mm',
      {
        locale: ptBR,
      }
    )

  const post = {
    uid: res.uid,
    first_publication_date: res.first_publication_date,
    format_last_publication_date: format_last_publication_date,
    data: {
      title: res.data.title,
      subtitle: res.data.subtitle,
      author: res.data.author,
      banner: {
        url: res.data.banner.url,
      },
      content: res.data.content
    },
    ref: previewData?.ref ?? null,
  }

  return {
    props: {
      post,
      previewRef,
      nextPost,
      prevPost,
    },
    revalidate: 60 * 30,
  }

}