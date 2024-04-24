import Autocomplete from '@mui/lab/Autocomplete';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import dashboardService from '../../../../API/Services/dashboard.service';
import authService from '../../../../API/Services/auth.service';
import { MaterialReactTable } from 'material-react-table';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
/* import { isNullOrUndef } from 'chart.js/dist/helpers/helpers.core'; */

async function dataFunc() {
    return await dashboardService.getFoodsList();
}

async function userDataFoods(currentUser) {
  return await dashboardService.getUserFoodList(currentUser);
}

async function addFoodRow(currentUser, values) {
    return await dashboardService.addUserFood(currentUser, values.food, values.amount);
}

async function addCustomFoodToList(currentUser, values) {
  return await dashboardService.addCustomFoodToList(currentUser, values);
}

function calcCalories(values){
  return  (values?.protein > 0 ? values.protein * 4 : 0) +
          (values?.fats > 0 ? values.fats * 9 : 0) +
          (values?.carbs > 0 ? values.carbs * 4 : 0);
}


const Example = ({handleCalcedIntake}) => {
    const [currentUser, setCurrentUser] = useState(JSON.parse(authService.getCurrentUser()).username);
    const [data, setData] = useState([]);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createCustomModalOpen, setCreateCustomModalOpen] = useState(false);
    const [tableData, setTableData] = useState((() => data));
    const [validationErrors, setValidationErrors] = useState({});
    const [firstFoodsList, setfirstFoodsList] = useState([]);

    useEffect(() => {
        userDataFoods(currentUser).then(result => {
            var list = result.result.map((food) => {
              const { amount, ...restFood } = food.food;
              return {
                id: food.id,
                amount: food.amount,
                food: restFood.food,
                calories: Math.trunc((restFood.calories/amount) * food.amount),
                fats: Math.trunc((restFood.fats/amount) * food.amount),
                protein: Math.trunc((restFood.protein/amount) * food.amount),
                carbs: Math.trunc((restFood.carbs/amount) * food.amount)
              }
            });
            setData(list);
            setTableData((() => list));
            handleCalcedIntake(list);
        })
        // Fetch the data inside the useEffect hook
        dataFunc().then(result => {
/*             var foods = result.result.map(food => food.food); */
            setfirstFoodsList(result.result);
        });
        }, []); // Empty dependency array to run the effect only on mount

  function calculateFoodProperties(masterFoodList, food, amount) {
    const calculatedRow = { ...masterFoodList.find(calcedRow => calcedRow.food === food) };
    if(calculatedRow.amount != amount) {
      let prevAmount = calculatedRow.amount;
      calculatedRow['protein'] = Math.trunc((calculatedRow.protein / prevAmount) * amount);
      calculatedRow['fats'] = Math.trunc((calculatedRow.fats / prevAmount) * amount);
      calculatedRow['carbs'] = Math.trunc((calculatedRow.carbs / prevAmount) * amount);
      calculatedRow['calories'] = Math.trunc((calculatedRow.calories / prevAmount) * amount);
      calculatedRow['amount'] = amount;
    }

    return calculatedRow;
  }

  

  const handleCreateNewRow = async (values) => {
    const calcedValues = calculateFoodProperties(firstFoodsList, values.food, values.amount);
    const added = await addFoodRow(currentUser, calcedValues);
    calcedValues["id"] = added.user.id;
    tableData.push(calcedValues);
    setTableData([...tableData]);
    handleCalcedIntake(tableData);
  };

  const handleCreateCustomFood = async (values) => {
    
    const added = await addCustomFoodToList(currentUser, values);
    
    const addedUserFood = await addFoodRow(currentUser, values);
    values["id"] = addedUserFood.user.id;
    let tempMainFoodList = [...firstFoodsList, { 
      id: values.id,
      food: values.food, 
      amount: parseInt(values.amount),
      calories: parseInt(values.calories),
      carbs: parseInt(values.carbs),
      fats: parseInt(values.fats),
      protein: parseInt(values.protein)
    }];
    setfirstFoodsList(tempMainFoodList);
    console.log('User Food info: ', addedUserFood);
    const calcedValues = calculateFoodProperties(tempMainFoodList, values.food, values.amount);
    tableData.push(calcedValues);
    setTableData([...tableData]);
    handleCalcedIntake(tableData);
    setCreateCustomModalOpen(false);
  }

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      const calcedValues = calculateFoodProperties(firstFoodsList, values.food, values.amount);
      tableData[row.index].amount = calcedValues.amount;
      tableData[row.index].protein = calcedValues.protein;
      tableData[row.index].calories = calcedValues.calories;
      tableData[row.index].carbs = calcedValues.carbs;
      tableData[row.index].fats = calcedValues.fats;
      const updatedRow = await dashboardService.updateUserFoodAmount(values.id, values.amount);
      calculateFoodProperties(firstFoodsList, values.food, values.amount);
      setTableData([...tableData]);
      handleCalcedIntake(tableData);
      exitEditingMode(); //required to exit editing mode and close modal
    }
  };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleDeleteRow = useCallback(
    async (row) => {
      const deleted = await dashboardService.deleteUserFood(tableData[row.id].id);
      if(deleted) {
        tableData.splice(row.index, 1);
        setTableData([...tableData]);
        handleCalcedIntake(tableData);
      }
      
    },
    [tableData],
  );

  const getCommonEditTextFieldProps = useCallback(
    (cell) => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        onBlur: (event) => {
          const isValid =
            cell.column.id === 'email'
              ? validateEmail(event.target.value)
              : cell.column.id === 'age'
              ? validateAge(+event.target.value)
              : validateRequired(event.target.value);
          if (!isValid) {
            //set validation error for cell if invalid
            setValidationErrors({
              ...validationErrors,
              [cell.id]: `${cell.column.columnDef.header} is required`,
            });
          } else {
            //remove validation error for cell if valid
            delete validationErrors[cell.id];
            setValidationErrors({
              ...validationErrors,
            });
          }
        },
      };
    },
    [validationErrors],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableColumnOrdering: false,
        enableEditing: false, //disable editing on this column
        enableSorting: true,
        type: 'number',
        size: 60,
      },
      {
        accessorKey: 'food',
        header: 'Food',
        enableColumnOrdering: false,
        enableEditing: false, //disable editing on this column
        enableSorting: true,
        size: 80,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        type: 'number',
        size: 80,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
      {
        accessorKey: 'calories',
        header: 'Calories',
        enableEditing: false,
        size: 60,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: 'number',
        }),
      },
      {
        accessorKey: 'protein',
        header: 'Protein',
        enableEditing: false,
        size: 60,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: 'number',
        }),
      },
      {
        accessorKey: 'carbs',
        header: 'Carbs',
        enableEditing: false,
        size: 60,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: 'number',
        }),
      },
      {
        accessorKey: 'fats',
        header: 'Fats',
        enableEditing: false,
        size: 60,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: 'number',
        }),
      },
    ],
    [getCommonEditTextFieldProps],
  );

  return (
    <>
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: {
              align: 'center',
            },
            size: 120,
          },
        }}
        columns={columns}
        data={tableData}
        initialState={{
          sorting: [
              { id: 'id', desc: true },
          ],
          columnVisibility: { id: false } }}
        editingMode="modal" //default
        enableColumnOrdering
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
        onEditingRowCancel={handleCancelRowEdits}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement="left" title="Edit">
              <IconButton onClick={() => table.setEditingRow(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Delete">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <div className='flex w-full'>
              <div className='mr-2'><Button
              color="secondary"
              onClick={() => setCreateModalOpen(true)}
              variant="contained"
              className='mr-2'
              >
              Add new Calorie intake
              </Button></div>
              <div><Button
              color="secondary"
              onClick={() => setCreateCustomModalOpen(true)}
              variant="contained"
              >
              Add Custom Food
              </Button></div>
          </div>
        )}
      />
      <CreateNewAccountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
        firstFoodsList={firstFoodsList}
      />
      <CreateCustomModal
        columns={columns}
        open={createCustomModalOpen}
        onClose={() => setCreateCustomModalOpen(false)}
        onSubmit={handleCreateCustomFood}
      />
    </>
  );
};

export const CreateCustomModal = ({open, columns, onClose, onSubmit}) => {
  const [values, setValues] = useState({});
  const [isError, setIsError]= useState(false);
  
  const handleSubmit = () => {
    let customValues = values;
    console.log('this is going to be saved in DB so we could later add it up in out food intake');
    if(values.calories == '1' || values["calories"] == undefined) {
      customValues = { ...values ,calories: calcCalories(values) };
    }
    console.log(customValues);
    onSubmit(customValues);
    onClose();
    setValues({});
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
          {/* {isError && <div className='text-red-700 font-bold flex justify-center shake'>{msg}</div>} */}
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="secondary" onClick={handleSubmit} variant="contained">
          Create New Custom Food
        </Button>
      </DialogActions>
    </Dialog>
  )
}

//example of creating a mui dialog modal for creating new rows
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
  const [values, setValues] = useState({});
  
  const [msg, setMsg] = useState('');
  useEffect(() => {
      const newValues = columns.reduce((acc, column) => {
        acc[column.accessorKey ?? ''] = '';
        return acc;
      }, {});
      setValues(newValues);
  }, [columns]);

  const handleSubmit = () => {
    //put your validation logic here
    console.log(values)
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

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
const validateAge = (age) => age >= 18 && age <= 50;
const validateNum = (num) => num >= 0 && num <= 999;


export default Example;
