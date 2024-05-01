//example of creating a mui dialog modal for creating new rows
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {Box,Button,Dialog, DialogActions,DialogContent,DialogTitle,IconButton,MenuItem,Stack,TextField,Tooltip} from '@mui/material';
import Autocomplete from '@mui/lab/Autocomplete';

export const CreateNewAccountModal = ({ open, columns, onClose, onSubmit, firstFoodsList }) => {
    const [isError, setIsError] = useState(false);
    
    const validate = (values) => {
        console.log('tried to validate')
        let flag = false;
        if(Object.keys(values).length < 2){flag = true;}
          for(let key in values) {
            if(!values[key] && values[key] != '0') {
              flag = true;
            }
          }
          return flag;
        
    }
    const [values, setValues] = useState(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = '';
      return acc;
    }, {}),
  );
   /*  const [values, setValues] = useState({}); */
    
    const [msg, setMsg] = useState('');
   /*  useEffect(() => {
        const newValues = columns.reduce((acc, column) => {
          acc[column.accessorKey ?? ''] = '';
          return acc;
        }, {});
        setValues(newValues);
    }, [columns]); */
  
    const handleSubmit = () => {
      validate(values);
      if(!validate(values)){
        setIsError(false);
        onSubmit(values);
        onClose();
        setValues({});
      } else {
        setIsError(true);
        setMsg('Please Select Food from the Dropdown');
      }
      
    };
  
    return (
      <Dialog open={open}>
        <DialogTitle textAlign="center">Add food intake</DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <Stack
              sx={{
                width: '100%',
                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                gap: '1.5rem',
                minHeight: '500px',
              }}
            >
                  <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      label='Food'
                      name='food'
                      options={firstFoodsList}
                      getOptionLabel={(option) => option.food}
                      sx={{ width: 300 }}
                      renderInput={(params) => <TextField {...params} label="Food" />}
                      onChange={
                        (_, newValue) => {
                        setValues(prevValues => ({ ...prevValues, ...newValue }))
                        setIsError(false);
                        }
                      }
  
                  />
                  
              {columns.map((column) => (
                column.accessorKey == 'amount' ? <TextField
                  id={column.accessorKey}
                  key={column.accessorKey}
                  label={column.header}
                  type="number"
                  name={column.accessorKey}
                  onChange={(e) =>{
                    setValues({ ...values, [e.target.name]: e.target.value })
                    setIsError(false)}
                  }
                /> : <></>
              ))}
            </Stack>
            {isError && <div className='text-red-700 font-bold flex justify-center shake'>{msg}</div>}
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button color="secondary" onClick={handleSubmit} variant="contained">
            Create New log
          </Button>
        </DialogActions>
      </Dialog>
    );
  };