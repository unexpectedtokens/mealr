// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Backdrop,
//   TextField,
//   Button,
//   IconButton,
// } from "@material-ui/core";
// import { EditOutlined } from "@material-ui/icons";
// import { useEffect, useState } from "react";

// const Description = ({ description, recipeid }) => {
//   const [openEdit, setOpenEdit] = useState(false);
//   const [newDescription, setNewDescription] = useState();
//   const handleSave = () => {
//     setOpenEdit(false);
//   };
//   const handleCancel = () => {
//     setNewDescription(description);
//     setOpenEdit(false);
//   };
//   useEffect(() => {
//     setNewDescription(description);
//   }, [description]);
//   return (
//     <>
//       <Box py={2}>
//         <Card>
//           <CardContent>
//             <Box display="flex" justifyContent="space-between">
//               <Typography variant="h6">Description</Typography>
//               <IconButton onClick={() => setOpenEdit(true)}>
//                 <EditOutlined />
//               </IconButton>
//             </Box>
//             <Typography>{description ? description : "-"}</Typography>
//           </CardContent>
//         </Card>
//       </Box>
//     </>
//   );
// };

// export default Description;
