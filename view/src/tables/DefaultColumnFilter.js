export const DefaultColumnFilter = ({
  column: { filterValue, setFilter }
}) => {
  return (
      <input
          value={filterValue || ''}
          onChange={e => {
            setFilter(e.target.value || undefined)
          }}
      />
  )
}
