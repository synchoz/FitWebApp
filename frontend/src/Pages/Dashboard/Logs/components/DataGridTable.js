import Autocomplete from '@mui/lab/Autocomplete';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import dashboardService from '../../../../API/Services/dashboard.service';
import authService from '../../../../API/Services/auth.service';
import { CreateCustomModal } from './DataGridTable/CreateCustomModal';
import { CreateNewAccountModal } from './DataGridTable/CreateNewAccountModal';
import { MaterialReactTable } from 'material-react-table';
import {Box,Button,Dialog, DialogActions,DialogContent,DialogTitle,IconButton,MenuItem,Stack,TextField,Tooltip} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

async function dataFunc() {
    return await dashboardService.getFoodsList();
}

async function userDataFoods(currentUser) {
  return await dashboardService.getUserFoodList(currentUser);
}

async function addFoodRow(currentUser, values) {
    return await dashboardService.addUserFood(currentUser, values.food, values.amount, values.calories, values.proteins, values.fats, values.carbs);
}

async function addCustomFoodToList(currentUser, values) {
  return await dashboardService.addCustomFoodToList(currentUser, values);
}

const Example = ({handleCalcedIntake}) => {
    const [currentUser, setCurrentUser] = useState(JSON.parse(authService.getCurrentUser()).username);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createCustomModalOpen, setCreateCustomModalOpen] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [firstFoodsList, setfirstFoodsList] = useState([]);

    useEffect(() => {
        userDataFoods(currentUser).then(result => {
            var list = result.result.map((food) => {
              return {
                id: food.id,
                amount: food.amount,
                food: food.userfood,
                calories: food.calories,
                fats: food.fats,
                proteins: food.proteins,
                carbs: food.carbs
              }
            });
            setTableData((() => list));
            handleCalcedIntake(list);
        })
        dataFunc().then(result => {
            setfirstFoodsList(result.result);
        });
        }, []); 

  function calculateFoodPropertiesFromMaster(masterFoodList, food, amount) {
    const calculatedRow = { ...masterFoodList.find(calcedRow => calcedRow.food === food) };
    if(calculatedRow.amount != amount) {
      let prevAmount = calculatedRow.amount;
      calculatedRow['proteins'] = Math.trunc((calculatedRow.proteins / prevAmount) * amount);
      calculatedRow['fats'] = Math.trunc((calculatedRow.fats / prevAmount) * amount);
      calculatedRow['carbs'] = Math.trunc((calculatedRow.carbs / prevAmount) * amount);
      calculatedRow['calories'] = Math.trunc((calculatedRow.calories / prevAmount) * amount);
      calculatedRow['amount'] = amount;
      //and once again i have calculations here why not just do it in SQL ???? why here i'm not sure...
    }

    return calculatedRow;
  }

  const handleCreateNewRow = async (values) => {
    const calcedValues = calculateFoodPropertiesFromMaster(firstFoodsList, values.food, values.amount);
    const added = await addFoodRow(currentUser, calcedValues);
    calcedValues["id"] = added.user.id;//needed for updating the row food
    setTableData([...tableData, calcedValues]);
    handleCalcedIntake(tableData);
  };

  const handleCreateCustomFood = async (values) => {
    const foodObjValues = { 
      id: values.id,
      food: values.food, 
      amount: parseInt(values.amount),
      calories: parseInt(values.calories),
      carbs: parseInt(values.carbs),
      fats: parseInt(values.fats),
      proteins: parseInt(values.proteins)
    }

    addCustomFoodToList(currentUser, foodObjValues);
    const addedRow = await addFoodRow(currentUser, foodObjValues);
    foodObjValues["id"] = addedRow.user.id;//needed for updating the row food
    let tempMainFoodList = [...firstFoodsList, foodObjValues];
    setfirstFoodsList(tempMainFoodList);
    setTableData([...tableData, foodObjValues]);
    handleCalcedIntake(tableData);
    setCreateCustomModalOpen(false);
  }

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      let tempTableData = [...tableData];
      const calcedValues = calculateFoodPropertiesFromMaster(firstFoodsList, values.food, values.amount);
      tempTableData[row.index].amount = calcedValues.amount;
      tempTableData[row.index].proteins = calcedValues.proteins;
      tempTableData[row.index].calories = calcedValues.calories;
      tempTableData[row.index].carbs = calcedValues.carbs;
      tempTableData[row.index].fats = calcedValues.fats;
      dashboardService.updateUserFoodAmount(values.id, values.amount);
      setTableData([...tempTableData]);
      handleCalcedIntake(tempTableData);
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
          console.log('entered the event: ', event)
          const isValid =
              cell.column.id === 'amount'
              ? validateNum(+event.target.value)
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
        accessorKey: 'proteins',
        header: 'Proteins',
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

const validateRequired = (value) => !!value.length;
/* const validateEmail = (email) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    ); */
//const validateAge = (age) => age >= 18 && age <= 50;
const validateNum = (num) => num >= 0 && num <= 999;

export default Example;
