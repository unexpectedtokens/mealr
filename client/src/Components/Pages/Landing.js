import { Button, Container } from "@material-ui/core";
import { useHistory } from "react-router-dom";

function Index(props) {
  let history = useHistory();
  return (
    <Container>
      <Button onClick={() => history.push("/auth/")}>Log in</Button>
    </Container>
  );
}

export default Index;
