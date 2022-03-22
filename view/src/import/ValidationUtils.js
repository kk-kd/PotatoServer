

export const CheckStudentCell = (col, val, schools, users, emails, schoolNames) => {
    if (col === 'index' || col === 'valid') {
        return ''
    }
    // check for columns
    else if (val) {
        return '';
    }
    else {
        return 'Empty';
    }
    
} 

export const CheckParentCell = (col, val, schools, users, emails, schoolNames) => {
    
} 

export const CheckStudentRow = (row, schools, users, emails, schoolNames) => {
    console.log(row)
    
    for (const [key, value] of Object.entries(row)) {
        let m = CheckStudentCell(key, value)
        if (m) {
            console.log(key, value)
            return m;
        }
    }  
    return ''; 
} 

export const CheckParentRow = (row, schools, users, emails, schoolNames) => {
    return '';
    
} 