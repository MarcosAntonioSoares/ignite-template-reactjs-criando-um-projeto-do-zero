import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PrismicDOM from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import PostComponet from '../../components/Post/';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps) {
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
              </div>
              <PostComponet content={post.data.content} />
            </div>
          </div>
        </article>

      </main>
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


export const getStaticProps: GetStaticProps = async (context) => {
  const prismic = getPrismicClient();
  const { slug } = context.params
  const res = await prismic.getByUID('p', String(slug), {});

  const post = {
    uid: res.uid,
    first_publication_date: res.first_publication_date,
    data: {
      title: res.data.title,
      subtitle: res.data.subtitle,
      author: res.data.author,
      banner: {
        url: res.data.banner.url,
      },
      content: res.data.content
    }
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 30,
  }

}