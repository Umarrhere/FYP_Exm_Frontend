import { ChangeCircle, DeleteOutline, Edit, EditNotificationsRounded } from '@mui/icons-material';
import { Backdrop, Button } from '@mui/material';
import { useState } from 'react';
import DataTable from 'react-data-table-component';

export const FacultyList = ({ faculty }) => {
 
   const columns = [
    {
        name: 'Name',
        selector: row => row.name,
    },
    {
        name: 'ID',
        selector: row => row.regno,
    },
    {
      name: 'Dept',
      selector: row => row.dept,
    },
    {
      name: 'Joined',
      selector: row => row.joined,
    },
    {
      name: 'Action',
      center: true,
      wrap: true,
      selector: row => {
        return(
          <>
          <Button>
            <Edit fontSize='small' color='' />
          </Button>
          <Button>
            <DeleteOutline fontSize='small' color='error' />
          </Button>
          </>
          
        )
      }
    }
  ];

  
  const data = []
  faculty.map(x => {
    data.push({
      id: x._id,
      name: x.name,
      regno: x.regno,
      dept: x.dept,
      joined: x.joined
    })
  })

  const customStyles = {
    rows: {
        style: {
           
        },
    },
    headCells: {
        style: {
            backgroundColor: "#514E4E",
            color: 'White'
        },
    },
    cells: {
        style: {
          
        },
    },
};
  return (
  
  <>
      <DataTable 
        columns={columns}
        data={data}
        pagination
        fixedHeader
        fixedHeaderScrollHeight={"70vh"}
        defaultPageSize={100}
        theme='black'
        customStyles={customStyles}
        
       
      />
    </>
  )
}
