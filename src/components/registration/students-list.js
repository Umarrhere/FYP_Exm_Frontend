import { ChangeCircle, DeleteOutline, Edit, EditNotificationsRounded } from '@mui/icons-material';
import { Backdrop, Button } from '@mui/material';
import { useState } from 'react';
import DataTable from 'react-data-table-component';

export const StudentsList = ({ students, ...rest }) => {
 
  const columns = [
    {
        name: 'Name',
        selector: row => row.name,
    },
    {
        name: 'Reg-No',
        selector: row => row.regNo,
    },
    {
      name: 'Session',
      selector: row => row.session
    },
    {
      name: 'Dept',
      selector: row => row.dept,
    },
    {
      name: 'Degree',
      selector: row => row.degree,
    },
    {
      name: 'Batch',
      selector: row => row.batch,
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
  students.map(x => {
    data.push({
      id: x.id,
      name: x.name,
      regNo: x.regno,
      dept: x.dept,
      degree: x.degree,
      session: x.session,
      batch: x.batch,

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
