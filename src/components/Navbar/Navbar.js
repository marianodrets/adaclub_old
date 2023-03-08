import React from "react";
import { Container, LogoContainer, Wrapper,Menu, MenuItem, MenuItemLink, IconLogoMobile } from "./StyledNavbar";
import { FaRainbow, FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";

const Navbar = (menuItems) => {
    const [click, setClick] = useState(false);
    const ChangeClick = () => {
        setClick(!click)
    }
    const menuCab = menuItems.menuItems.filter(item => item.usma_item==='CAB');
    return(
        <Container>
            <Wrapper>

                <LogoContainer>
                    <FaRainbow size={"2em"}/>
                    <p>Vector</p>
                    <p>F(x)</p>
                </LogoContainer>
                <IconLogoMobile onClick = {() => ChangeClick()}> 
                    { click ? <FaTimes /> : <FaBars /> }
                    
                </IconLogoMobile>
                <Menu click={click}>
                { menuCab.map((elem,i) => {
                    return(
                        <MenuItem onClick = {() => ChangeClick()} key={i}>
                            <MenuItemLink href={elem.usma_enlace} >{elem.usma_des_item}</MenuItemLink>
                        </MenuItem>
                    )
                })}                  
                </Menu>
            </Wrapper>
        </Container>
    );
}

export default Navbar;