import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {Box,Button,Dialog, DialogActions,DialogContent,DialogTitle,IconButton,MenuItem,Stack,TextField,Tooltip} from '@mui/material';

function calcCalories(values){
  return  (values?.protein > 0 ? values.protein * 4 : 0) +
          (values?.fats > 0 ? values.fats * 9 : 0) +
          (values?.carbs > 0 ? values.carbs * 4 : 0);
}

const emptyObFoods = {
  food: '',
  amount: '',
  calories: '',
  proteins: '',
  fats: '',
  carbs: ''
}

export const CreateCustomModal = ({open, columns, onClose, onSubmit}) => {
    const [values, setValues] = useState(emptyObFoods);
    const [isError, setIsError] = useState(false);
    const [msg, setMsg] = useState('');

    const validate = (values) => {
      console.log('tried to validate')
      let flag = false;
      if(Object.keys(values).length < 2){
        flag = true;
      }
        for(let key in values) {
          let num = parseInt(values[key])
          if(!values[key] && values[key] != '0') {
            flag = true;
          } 
          if(key != "food" && ( ( num < 1 || num > 999 ) || (!Number.isInteger(num) && key != "food" ) ) ) {
            flag = true;
          } 
        }
        return flag;
  }
    
    const handleSubmit = () => {
      if(!validate(values)) {
        let customValues = values;
        /* if(values.calories == '1' || values["calories"] == undefined) { */
          customValues = { ...values ,calories: calcCalories(values) };
       /*  } */
        onSubmit(customValues);
        onClose();
        setValues(emptyObFoods);
      } else {
        setIsError(true);
        setMsg('One or more fields had a bad Input...')
      }
      
    }
  
    return(
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
              {columns.map((column) => (
                column.accessorKey != 'id' && <TextField
                  id={column.accessorKey}
                  key={column.accessorKey}
                  label={column.header}
                  type="text"
                  name={column.accessorKey}
                  onChange={(e) =>{
                    setValues({ ...values, [e.target.name]: e.target.value })
                    setIsError(false)}
                  }
                />
              ))}
            </Stack>
            {isError && <div className='text-red-700 font-bold flex justify-center shake'>{msg}</div>}
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={() => {
                                    onClose();
                                    setIsError(false);
                                  }}>Cancel
          </Button>
          <Button color="secondary" onClick={handleSubmit} variant="contained">
            Create New Custom Food
          </Button>
        </DialogActions>
      </Dialog>
    )
  }