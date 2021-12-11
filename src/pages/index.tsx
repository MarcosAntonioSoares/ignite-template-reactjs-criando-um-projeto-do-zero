import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
  pageNum: number;
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [loading, seLoading] = useState(false)

  function hancleMorePosts() {
    seLoading(true);
    fetch(nextPage)
      .then(res => res.json())
      .then(function (dataResult) {
        const postsResult = dataResult.results.map((post) => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: post.data
          };
        });
        setPosts(oldPosts => [...oldPosts, ...postsResult]);
        setNextPage(dataResult['next_page']);
        seLoading(false);
      })
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main>
        <div className={commonStyles.main}>
          <div className={commonStyles.container}>
            <div>
              {posts.map(post => (
                <Link key={post.uid} href={`/post/${post.uid}`}>
                  <a className={styles.post}>
                    <strong>{post.data.title}</strong>
                    <p>{post.data.subtitle}</p>
                    <div className={styles.info}>
                      <time>
                        <FiCalendar />
                        {format(
                          new Date(post.first_publication_date),
                          'dd MMM yyyy',
                          {
                            locale: ptBR,
                          }
                        )}
                      </time>
                      <span>
                        <FiUser />
                        {post.data.author}
                      </span>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
            <div className={styles.load}>
              {loading && <span className={commonStyles.loading}>Carregando...</span>}
              {loading || nextPage && (
                <button
                  type="button"
                  onClick={hancleMorePosts}
                >
                  Carregar mais posts123
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'p')],
    {
      fetch: ['p.title', 'p.author', 'p.subtitle'],
      pageSize: 1,
      orderings: '[document.last_publication_date desc]'
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: post.data
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page
      },
    },
    revalidate: 60 * 30, // 30 minutos
  };
};
