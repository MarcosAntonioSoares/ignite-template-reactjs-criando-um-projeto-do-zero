import React from 'react'
import { RichText } from 'prismic-reactjs'
import styles from './post.module.scss';

export default function SliceZone({ sliceZone }) {

  const body = sliceZone.map((post, index) => {
    return (
      <React.Fragment key={index}>
        <h3>{post.heading}</h3>
        <RichText render={post.body} />
      </React.Fragment>
    )
  })
  return (
    <div className={styles.content}>{body}</div>
  )
}