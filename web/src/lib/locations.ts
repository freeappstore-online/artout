import type { ArtPost, LocationNode } from './types'

export function buildLocationTree(posts: ArtPost[]): LocationNode[] {
  const root: LocationNode[] = []

  for (const post of posts) {
    if (!post.locationPath) continue
    const parts = post.locationPath.split(' > ').map((s) => s.trim()).filter(Boolean)
    let siblings = root
    let pathSoFar = ''

    for (const part of parts) {
      pathSoFar = pathSoFar ? `${pathSoFar} > ${part}` : part
      let node = siblings.find((n) => n.name === part)
      if (!node) {
        node = { name: part, path: pathSoFar, count: 0, children: [] }
        siblings.push(node)
      }
      node.count++
      siblings = node.children
    }
  }

  // Sort each level alphabetically
  const sortNodes = (nodes: LocationNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    for (const n of nodes) sortNodes(n.children)
  }
  sortNodes(root)

  return root
}

export function getPostsForPath(posts: ArtPost[], path: string): ArtPost[] {
  return posts.filter((p) => p.locationPath === path || p.locationPath.startsWith(path + ' > '))
}
