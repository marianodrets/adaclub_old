import React from "react";
import { URL_DB } from "./../../constants";
import axios from "axios";
import {
    Table,
    Row,
    Col,
    Container,
    Button,
    Form,
    FormControl
} from "react-bootstrap";
import exportToCSV from "../../utils/functions/export-excel";
import { DiDatabase } from "react-icons/di";
import { FaDownload } from "react-icons/fa";
import ordenarGrilla from "./../../utils/functions/ordenar-grilla";
import "../../pages/stylePages.css";

class SociosReportes extends React.Component {
    constructor(props) {
        super(props);

        var currentdate = new Date();

        this.state = {
            lee_mod: props.lee_mod,
            opcion: "soc",
            opcRepo: [
                { opc: "soc", deno: "Socio/Grupo" },
                { opc: "fam", deno: "Grupos familiares" },
                { opc: "vig", deno: "Socios Vigentes" },
                { opc: "baj", deno: "Socios Dados de Baja" },
                { opc: "alt", deno: "Socios Dados de Alta" }
            ],
            desde: currentdate.toISOString().split("T")[0],
            hasta: currentdate.toISOString().split("T")[0],
            socio: "",

            registros: [],
            login_id: sessionStorage.getItem("USUA_ID"),

            filterGrilla: "",
            fetchRegistros: false,
            expSql: "",
            expTitulo: "Reporte de Socios",
            expSubtit: "",
            respuestaSp: [],
            respError: "",
            mensajeAlerta: ""
        };
    }

    componentDidMount() {
        //this.poblarGrilla(this.state.opcion);
    }

    /*==========================================================================
   Utilidades de filtros y sort para la grilla ppal 
  *==========================================================================*/
    filtrarDatos() {
        const escapedValue = this.state.filterGrilla
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedValue, "i");
        return this.state.registros.filter(
            filtro =>
                regex.test(filtro.soci_codi) ||
                regex.test(filtro.apenom) ||
                regex.test(filtro.soci_codi) ||
                regex.test(filtro.cate_deno) ||
                regex.test(filtro.soci_domi) ||
                regex.test(filtro.loca_localidad) ||
                regex.test(filtro.loca_partido) ||
                regex.test(filtro.soci_naci_f) ||
                regex.test(filtro.edad) ||
                regex.test(filtro.soci_sexo) ||
                regex.test(filtro.soci_docu) ||
                regex.test(filtro.pais) ||
                regex.test(filtro.soci_celular) ||
                regex.test(filtro.soci_ingre_f) ||
                regex.test(filtro.soci_baja_f) ||
                regex.test(filtro.motivo_baja) ||
                regex.test(filtro.ult_cuota_paga) ||
                regex.test(filtro.soci_responsable) ||
                regex.test(filtro.soci_resp_celu) ||
                regex.test(filtro.pare_deno) ||
                regex.test(filtro.soci_nota)
        );
    }

    ordenarGrilla = key => {
        const registros = ordenarGrilla(key, this.state.registros);

        this.setState({ registros });
    };

    /*==========================================================================
   Completo datos de grilla principal 
  *==========================================================================*/
    poblarGrilla = e => {
        this.setState({ registros: [] });

        if (
            this.state.opcion === "soc" ||
            this.state.opcion === "fam" ||
            this.state.opcion === "vig"
        ) {
            this.setState({ fetchRegistros: true });
            const sql = `${URL_DB}SEL_SOCIOS('${this.state.opcion}',${
                this.state.socio || 0
            },null,null)`;

            axios
                .get(sql)
                .then(response => {
                    this.setState({
                        registros: response.data[0],
                        expSql: sql,
                        expSubtit: this.state.opcRepo.find(
                            f => f.opc === this.state.opcion
                        ).deno
                    });
                })
                .catch(error => console.log(error))
                .finally(() => {
                    this.setState({ fetchRegistros: false });
                });
        } else {
            if (this.state.desde.length > 8 && this.state.desde.length > 8) {
                this.setState({ fetchRegistros: true });
                const sql = `${URL_DB}SEL_SOCIOS('${this.state.opcion}',0,'${this.state.desde}','${this.state.hasta}')`;

                axios
                    .get(sql)
                    .then(response => {
                        this.setState({
                            registros: response.data[0],
                            expSql: sql,
                            expSubtit: this.state.opcRepo.find(
                                f => f.opc === this.state.opcion
                            ).deno
                        });
                    })
                    .catch(error => console.log(error))
                    .finally(() => {
                        this.setState({ fetchRegistros: false });
                    });
            }
        }
    };

    /* Opciones del menu, trato hombres, mujeres o todos */
    handleChangeOpcion = event => {
        const { target } = event;
        const value =
            target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;

        this.setState({ [name]: value }, () => {
            this.setState({ registros: [] });
        });
    };

    /*==========================================================================
   RENDER
  *==========================================================================*/

    render() {
        const registrosFiltrados = this.filtrarDatos();

        return (
            <div>
                <Container fluid="true">
                    <Row>
                        <Col xs={2} style={{ fontSize: "22px" }}>
                            <b>Rep Socios</b>
                        </Col>
                        <Col xs={2}>
                            <Form.Group>
                                <Form.Label>
                                    <b>Seleccione consulta</b>
                                </Form.Label>
                                <select
                                    className="form-control"
                                    name="opcion"
                                    value={this.state.opcion}
                                    onChange={this.handleChangeOpcion}
                                >
                                    {this.state.opcRepo.map((opc, i) => {
                                        return (
                                            <option key={i} value={opc.opc}>
                                                {" "}
                                                {opc.deno}
                                            </option>
                                        );
                                    })}
                                </select>
                            </Form.Group>
                        </Col>
                        {this.state.opcion === "soc" && (
                            <Col xs={2}>
                                <Form.Group>
                                    <Form.Label>
                                        <b>Socio</b>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="socio"
                                        value={this.state.socio}
                                        onChange={this.handleChangeOpcion}
                                        style={{ fontWeight: "bold" }}
                                    />
                                </Form.Group>
                            </Col>
                        )}
                        {(this.state.opcion === "alt" ||
                            this.state.opcion === "baj") && (
                            <Col xs={2}>
                                <Form.Group>
                                    <Form.Label>
                                        <b>Desde</b>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="desde"
                                        value={this.state.desde}
                                        onChange={this.handleChangeOpcion}
                                        style={{ fontWeight: "bold" }}
                                    />
                                </Form.Group>
                            </Col>
                        )}
                        {(this.state.opcion === "alt" ||
                            this.state.opcion === "baj") && (
                            <Col xs={2}>
                                <Form.Group>
                                    <Form.Label>
                                        <b>Hasta</b>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="hasta"
                                        value={this.state.hasta}
                                        onChange={this.handleChangeOpcion}
                                        style={{ fontWeight: "bold" }}
                                    />
                                </Form.Group>
                            </Col>
                        )}
                        <Col xs={1}>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={this.poblarGrilla}
                            >
                                <DiDatabase />
                                Consultar
                            </Button>
                        </Col>
                        <Col xs={2}>
                            <Form.Group>
                                <Form.Label>
                                    <b>Buscar en esta grilla</b>
                                </Form.Label>
                                <FormControl
                                    type="text"
                                    name="buscar"
                                    placeholder="Texto a filtrar"
                                    className="mr-sm-2"
                                    onChange={e => {
                                        this.setState({
                                            filterGrilla: e.target.value
                                        });
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={1}>
                            {this.state.registros.length > 0 && (
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={e =>
                                        exportToCSV(
                                            this.state.expTitulo,
                                            this.state.expSubtit,
                                            this.state.expSql
                                        )
                                    }
                                >
                                    <FaDownload /> Excel
                                </Button>
                            )}
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Table
                                striped
                                bordered
                                hover
                                size="sm"
                                id="data_table"
                            >
                                <thead className="Grilla-header">
                                    <tr>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_codi"
                                                    )
                                                }
                                            >
                                                GrFam
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "usu_apenom"
                                                    )
                                                }
                                            >
                                                #Socio
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla("apenom")
                                                }
                                            >
                                                Apellido y nom
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "cate_deno"
                                                    )
                                                }
                                            >
                                                Categ
                                            </Button>
                                        </th>

                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_domi"
                                                    )
                                                }
                                            >
                                                Domicilio
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "loca_localidad"
                                                    )
                                                }
                                            >
                                                Localidad
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "loca_partido"
                                                    )
                                                }
                                            >
                                                Partido
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_naci_f"
                                                    )
                                                }
                                            >
                                                F.Nacimiento
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla("edad")
                                                }
                                            >
                                                Edad
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_sexo"
                                                    )
                                                }
                                            >
                                                Sexo
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_docu"
                                                    )
                                                }
                                            >
                                                #Docum
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla("pais")
                                                }
                                            >
                                                Pais
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_celular"
                                                    )
                                                }
                                            >
                                                Celular
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_mail"
                                                    )
                                                }
                                            >
                                                Mail
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_tele"
                                                    )
                                                }
                                            >
                                                Teléf
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_ingre_f"
                                                    )
                                                }
                                            >
                                                Ingreso
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_baja_f"
                                                    )
                                                }
                                            >
                                                F.Baja
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "motivo_baja"
                                                    )
                                                }
                                            >
                                                Mot.Baja
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "ult_cuota_paga"
                                                    )
                                                }
                                            >
                                                Ult.Cuo
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "meses_deu"
                                                    )
                                                }
                                            >
                                                Deu
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_responsable"
                                                    )
                                                }
                                            >
                                                Respons
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "pare_deno"
                                                    )
                                                }
                                            >
                                                Parent
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_resp_celu"
                                                    )
                                                }
                                            >
                                                CeluResp
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "soci_nota"
                                                    )
                                                }
                                            >
                                                Notas
                                            </Button>
                                        </th>
                                        <th>
                                            <Button
                                                variant="dark"
                                                size="sm"
                                                onClick={() =>
                                                    this.ordenarGrilla(
                                                        "actividad"
                                                    )
                                                }
                                            >
                                                Actividad
                                            </Button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.fetchRegistros && "Cargando..."}
                                    {registrosFiltrados.map((regis, i) => {
                                        return (
                                            <tr key={i}>
                                                <td>{regis.sofa_grupo_deno}</td>
                                                <td
                                                    style={{
                                                        backgroundColor:
                                                            regis.estado_color
                                                    }}
                                                >
                                                    {regis.soci_codi}
                                                </td>
                                                <td
                                                    style={{
                                                        backgroundColor:
                                                            regis.estado_color
                                                    }}
                                                >
                                                    {regis.apenom}
                                                </td>
                                                <td
                                                    style={{
                                                        backgroundColor:
                                                            regis.cate_color
                                                    }}
                                                >
                                                    {regis.cate_deno}
                                                </td>
                                                <td>{regis.soci_domi}</td>
                                                <td>{regis.loca_localidad}</td>
                                                <td>{regis.loca_partido}</td>
                                                <td>{regis.soci_naci_f}</td>
                                                <td>{regis.edad}</td>
                                                <td>{regis.soci_sexo}</td>
                                                <td>{regis.soci_docu}</td>
                                                <td>{regis.pais}</td>
                                                <td>{regis.soci_celular}</td>
                                                <td>{regis.soci_mail}</td>
                                                <td>{regis.soci_tele}</td>
                                                <td>{regis.soci_ingre_f}</td>
                                                <td>{regis.soci_baja_f}</td>
                                                <td>{regis.motivo_baja}</td>
                                                <td>{regis.ult_cuota_paga}</td>
                                                <td>{regis.meses_deu}</td>
                                                <td>
                                                    {regis.soci_responsable}
                                                </td>
                                                <td>{regis.pare_deno}</td>
                                                <td>{regis.soci_resp_celu}</td>
                                                <td>{regis.soci_nota}</td>
                                                <td>{regis.actividad}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                {registrosFiltrados.length > 0 && (
                                    <tfoot className="Grilla-header">
                                        <td colSpan={2} />
                                        <td
                                            style={{ textAlign: "center" }}
                                        >{`${registrosFiltrados.length} Reg`}</td>
                                        <td colSpan={5} />
                                        <td>{`Prom:${Math.round(
                                            registrosFiltrados.reduce(
                                                (acum, act) =>
                                                    acum + Number(act.edad),
                                                0
                                            ) / registrosFiltrados.length
                                        )}`}</td>
                                        <td colSpan={15} />
                                    </tfoot>
                                )}
                            </Table>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default SociosReportes;
