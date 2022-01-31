import "./ListUsers.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import { useTable } from "react-table";
import { DefaultColumnFilter } from "./../tables/DefaultColumnFilter";
import { getAllUsers, deleteUser} from "../api/axios_wrapper";
import { filterAllUsers } from "../api/axios_wrapper";

export const ListUsers = () => {
  
  let navigate = useNavigate();
  function generateUserDetailLink(uid) {
    return "/Users/info/" + uid; 
  }

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(1);
  const [size, setSize] = useState(10);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("none");
  const [sortDirec, setSortDirec] = useState("none");
  const [emailFilter, setEmailFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await filterAllUsers({
          page: page,
          size: size,
          sort: sortBy,
          sortDir: sortDirec,
          filterType: lastNameFilter,
          filterData: emailFilter,
          showAll: showAll
        });
        setData(fetchedData.data.users);
        setTotal(fetchedData.data.total);
      } catch (error) {
        alert(error.response.data);
      }
    };
    fetchData();
  }, [page, size, sortDirec, emailFilter, lastNameFilter, showAll]);

  async function handleDeleteUser (user_id, e) {
    e.preventDefault(); 
   
    console.log("Deleting User with uid = " + user_id)
    try {
      let delete_user_response = await deleteUser(parseInt(user_id));      
      
    } catch (error)  {

      console.log(error)
      let message = error.response.data;
      throw alert (message);
    }
    navigate('/Users/info/' + user_id);
  }

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
        HeaderName: "Email",
        accessor: "email",
      },
      {
        Header: "First Name",
        accessor: "firstName",
      },
      {
        Header: "Middle Name",
        accessor: "middleName"
      },
      {
        HeaderName: "Last Name",
        accessor: "lastName"
      },
      {
        Header: "Address",
        accessor: "address",
      },
      {
        Header: "Administrator",
        accessor: "isAdmin",
        Cell: (props) => {
          return <label>{props.value.toString()}</label>;
        }
      },
      {
        Header: "Students",
        accessor: "students",
        Cell: (props) => {
          return <div>{props.value.map((student) => <div>{student.firstName}</div>)}</div>
        }
      },
        {
          Header: ' ',
          disableFilters: true,
          accessor: 'uid',
          Cell: ({value}) => { 
            return <div> 
              <Link to = {generateUserDetailLink(value)}> {"View User Detail"} </Link> 
              <button onClick = {(e) => {handleDeleteUser(value, e)}}> Delete User </button>
              </div> } 
        },
      ],
      []
  );

 
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });
  return (
    <div id="userListing">
      <h1>List Users</h1>
      <Link to="/Users/create">
        <button>Create User</button>
      </Link>
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
                  {column.id === "email" || column.id === "lastName" ? <div id="header">
                    <label onClick={() => {nextSort(column.id)}} style={{cursor: "pointer"}}>{column.HeaderName}</label>
                    <DefaultColumnFilter setFilter={column.id === "email" ? setEmailFilter : setLastNameFilter} />
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
        <button onClick={() => setPage(0)} disabled={page === 0 || showAll}>
          {'<<'}
        </button>{' '}
        <button onClick={() => setPage(page - 1)} disabled={page === 0 || showAll}>
          {'<'}
        </button>{' '}
        <button onClick={() => setPage(page + 1)} disabled={page >= total/size - 1 || showAll}>
          {'>'}
        </button>{' '}
        <button onClick={() => setPage(Math.ceil(total/size) - 1)} disabled={page >= total/size - 1 || showAll}>
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
        <label>Show All
          <input type="checkbox" value={showAll} onChange={e => setShowAll(!showAll)} />
        </label>
      </div>
    </div>
  );
};
