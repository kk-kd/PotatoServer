import "./ListBusRoutes.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTable } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { filterAllRoutes } from "./../api/axios_wrapper";

export const ListBusRoutes = () => {
  const [ data, setData ] = useState([]);
  const [ page, setPage ] = useState(0);
  const [ total, setTotal ] = useState(1);
  const [ size, setSize ] = useState(10);
  const [ sortBy, setSortBy ] = useState("none");
  const [ sortDirec, setSortDirec ] = useState("none");
  const [ nameFilter, setNameFilter ] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await filterAllRoutes({
          page: page,
          size: size,
          sort: sortBy,
          sortDir: sortDirec,
          nameFilter: nameFilter
        });
        if (fetchedData.data.special) {
          setData(fetchedData.data.routes.map(route => ({
            uid: route.routes_uid,
            name: route.routes_name,
            desciption: route.routes_desciption,
            students: route.count
          })));
        } else {
          setData(fetchedData.data.routes.map(route => ({...route, students: route.students.length || 0})));
        }
        setTotal(fetchedData.data.total);
      } catch (error) {
        alert(error.response.data);
      }
    };
    fetchData();
  }, [page, size, sortDirec, nameFilter]);

  const nextSort = (id) => {
    if (sortBy !== id) {
      setSortBy(id);
      if (sortDirec === "none" || sortDirec === "DESC") {
        setSortDirec("ASC");
      } else {
        setSortDirec("DESC");
      }
    } else if (sortDirec === "ASC") {
      setSortDirec("DESC");
    } else if (sortDirec === "DESC") {
      setSortDirec("none");
    } else {
      setSortDirec("ASC");
    }
  }

  const columns = useMemo(
      () => [
        {
          HeaderName: 'Route Name',
          accessor: 'name',
        },
        {
          HeaderName: 'School',
          accessor: 'school',
          Cell: (props) => {
            return <label>{props.value ? props.value.name : ""}</label>
          }
        },
        {
          HeaderName: 'Student Count',
          accessor: 'students'
        },
        {
          Header: 'Route Description',
          accessor: 'desciption'
        },
        {
          Header: "Detail Page",
          accessor: "uid",
          Cell: (props) => {
            return <Link to={`/Routes/info/${props.value}`}>view</Link>
          }
        }
      ],
      []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
      useTable({ columns, data });
  return (
      <div id="routeListing">
        <h1>List Routes</h1>
        <table {...getTableProps()} style={{ border: "solid 1px blue" }}>
          <thead>
          {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                    <th
                        {...column.getHeaderProps()}
                        style={{
                          borderBottom: "solid 3px red",
                          background: "aliceblue",
                          color: "black",
                          fontWeight: "bold",
                        }
                        }
                    >
                      {column.HeaderName ? <div id="header">
                        <label onClick={() => {nextSort(column.id)}} style={{cursor: "pointer"}}>{column.HeaderName}</label>
                        {column.id === "name" && <DefaultColumnFilter setFilter={setNameFilter} />}
                      </div> : column.render("Header")}
                    </th>
                ))}
              </tr>
          ))}
          </thead>
          <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                        <td
                            {...cell.getCellProps()}
                            style={{
                              padding: "10px",
                              border: "solid 1px gray",
                              background: "papayawhip",
                            }}
                        >
                          {cell.render("Cell")}
                        </td>
                    );
                  })}
                </tr>
            );
          })}
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={() => setPage(0)} disabled={page === 0}>
            {'<<'}
          </button>{' '}
          <button onClick={() => setPage(page - 1)} disabled={page === 0}>
            {'<'}
          </button>{' '}
          <button onClick={() => setPage(page + 1)} disabled={page >= total/size - 1}>
            {'>'}
          </button>{' '}
          <button onClick={() => setPage(Math.ceil(total/size) - 1)} disabled={page >= total/size - 1}>
            {'>>'}
          </button>{' '}
          <span>
          Page{' '}
            <strong>
            {page + 1}
          </strong>{' '}
        </span>
          <span>
          | Go to page:{' '}
            <input
                type="number"
                defaultValue={page + 1}
                onChange={e => {
                  const pagee = e.target.value ? Number(e.target.value) - 1 : 0
                  setPage(pagee)
                }}
                style={{ width: '100px' }}
            />
        </span>{' '}
          <select
              value={size}
              onChange={e => {
                setSize(Number(e.target.value))
              }}
          >
            {[10, 20, 30, 40, 50].map(size => (
                <option key={size} value={size}>
                  Show {size} out of {total}
                </option>
            ))}
          </select>
        </div>
      </div>
  );
}
