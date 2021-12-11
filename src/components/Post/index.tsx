import React from 'react'
import { RichText } from 'prismic-reactjs'
import styles from './post.module.scss';

export default function Post({ content }) {

  return (
    <div className={styles.content}>
      {content.map((post, i) => (
        <React.Fragment key={i}>
          <h3>{post.heading}</h3>
          <RichText render={post.body} />
        </React.Fragment>
      ))}
    </div>
  )
}