import React, { useCallback } from 'react'
import AlbumGallery from '../components/albumGallery/AlbumGallery'
import Layout from '../components/layout/Layout'
import useURLParameters from '../hooks/useURLParameters'
import useScrollPagination from '../hooks/useScrollPagination'
import PaginateLoader from '../components/PaginateLoader'
import { useTranslation } from 'react-i18next'
import { albumQuery, albumQueryVariables } from '../Pages/AlbumPage/__generated__/albumQuery'
import useOrderingParams from '../hooks/useOrderingParams'

let refetchNeededAll = false
let refetchNeededFavorites = false

type AlbumPageProps = {
  match: {
    params: {
      id: string
      subPage: string
    }
  }
}

function AlbumPage({ match }: AlbumPageProps) {
  const albumId = match.params.id

  const { t } = useTranslation()

  const urlParams = useURLParameters()
  const orderParams = useOrderingParams(urlParams)

  const onlyFavorites = urlParams.getParam('favorites') == '1' ? true : false
  const setOnlyFavorites = (favorites: boolean) =>
    urlParams.setParam('favorites', favorites ? '1' : '0')

  const { loading, error, data } = useQuery<
    albumQuery,
    albumQueryVariables
  >(ALBUM_QUERY, {
    variables: {
      id: albumId,
      onlyFavorites,
      mediaOrderBy: orderParams.orderBy,
      mediaOrderDirection: orderParams.orderDirection,
      offset: 0,
      limit: 200,
    },
  })

  const { containerElem, finished: finishedLoadingMore } =
    useScrollPagination<albumQuery>({
      loading,
      fetchMore,
      data,
      getItems: data => data.album.media,
    })

  const toggleFavorites = useCallback(
    onlyFavorites => {
      if (
        (refetchNeededAll && !onlyFavorites) ||
        (refetchNeededFavorites && onlyFavorites)
      ) {
        refetch({ id: albumId, onlyFavorites: onlyFavorites }).then(() => {
          if (onlyFavorites) {
            refetchNeededFavorites = false
          } else {
            refetchNeededAll = false
          }
          setOnlyFavorites(onlyFavorites)
        })
      } else {
        setOnlyFavorites(onlyFavorites)
      }
    },
    [setOnlyFavorites, refetch]
  )

  if (error) return <div>Error</div>

  return (
    <Layout
      title={
        data ? data.album.title : t('title.loading_album', 'Loading album')
      }
    >
      <AlbumGallery
        ref={containerElem}
        album={data && data.album}
        loading={loading}
        setOnlyFavorites={toggleFavorites}
        onlyFavorites={onlyFavorites}
        onFavorite={() => (refetchNeededAll = refetchNeededFavorites = true)}
        showFilter
        setOrdering={orderParams.setOrdering}
        ordering={orderParams}
      />
      <PaginateLoader
        active={!finishedLoadingMore && !loading}
        text={t('general.loading.paginate.media', 'Loading more media')}
      />
    </Layout>
  )
}

interface QueryArgs {
  variables: {
    id: string;
    [p: string]: boolean | string | number;
} }

export default AlbumPage

// function useQuery<T, U>(_graphql: any, arg: {variables: U})
//     : { loading: boolean; error: any; data: T;
//         refetch: ((U) => Promise<any>);
//         fetchMore: ({variables: {offset: number}}) => Promise<any> } {
//   throw new Error('Function not implemented.')
// }

