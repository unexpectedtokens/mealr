import { Backdrop, Card, Box, Typography, Button } from "@material-ui/core";
const Confirm = ({ showConfirm, hide, confirm, itemName }) => {
  return (
    <Backdrop open={showConfirm} style={{ zIndex: 1001 }}>
      <Card>
        <Box p={2}>
          <Typography>
            Are you sure you want to delete this {itemName}?
          </Typography>
          <Box pt={2} display="flex" justifyContent="flex-end">
            <Button onClick={hide} color="secondary">
              Cancel
            </Button>
            <Button color="primary" onClick={confirm}>
              Confirm
            </Button>
          </Box>
        </Box>
      </Card>
    </Backdrop>
  );
};

export default Confirm;
