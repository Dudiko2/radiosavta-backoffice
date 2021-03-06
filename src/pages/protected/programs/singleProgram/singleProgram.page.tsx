import { inject, observer } from "mobx-react";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import IdentityStore from "../../../../stores/identity.store";
import ProgramsStore from "../../../../stores/programs.store";

import { Page } from "../../../../components/Page/Page";
import { ProgramUser, IFullProgram } from "../../../../models/types";
import { AddUserToShowCard } from "../../../../components/AddUserToShow/AddUserToShow";
import { Tag, Col, Row, Card, Space, Button, Descriptions, Table } from "antd";
import { NoRecordedShows } from "../../../../components/EmptyState/NoRecordedShows";
import {
  ValidateRecordedShowResponse,
  ProgramsService,
} from "../../../../services/programs.service";
import {
  ValidateRecordedShow,
  SubmitRecordedShow,
} from "../../../../components/SubmitRecordedShow/SubmitRecordedShow";

import moment from "moment";
import { EditProgramTimes } from "../../../../components/EditProgramTimes/EditProgramTimes";

interface SingleProgramPageParams {
  id: string;
}
interface Props extends RouteComponentProps<SingleProgramPageParams> {
  identityStore: IdentityStore;
  programsStore: ProgramsStore;
  programsService: ProgramsService;
}

enum ProgramsLoaderTypes {
  ADD_USER_TO_PROGRAM = "ADD_USER_TO_PROGRAM",
  ADD_RECORDED_SHOW = "ADD_RECORDED_SHOW",
  REMOVE_USER_FROMM_SHOW = "REMOVE_USER_FROMM_SHOW",
}

enum SingeProgramPageModals {
  EDIT_TIMES = "EDIT_TIMES",
}

enum AddRecordedShowStatuses {
  VALIDATE = "VALIDATE",
  SUBMIT = "SUBMIT",
}
interface State {
  program?: IFullProgram;
  isLoading: boolean;
  loader: ProgramsLoaderTypes | null;
  availableUsers: ProgramUser[];
  isAddMemberOpen: boolean;
  AddRecordedShowStatus: AddRecordedShowStatuses | null;
  selectedUserToAdd: number | null;
  verifiedRecordedShow: ValidateRecordedShowResponse | null;
  openModal: SingeProgramPageModals | null;
}

const columns = [
  {
    title: "#",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Title",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Duration",
    dataIndex: "duration",
    key: "duration",
  },
  {
    title: "Url",
    dataIndex: "url",
    key: "url",
  },
  {
    title: "Visible to listeners?",
    dataIndex: "is_displayed",
    key: "is_displayed",
  },
];

@inject("identityStore", "programsStore", "programsService")
@observer
export class SingleProgramPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
      availableUsers: [],
      isAddMemberOpen: false,
      AddRecordedShowStatus: null,
      selectedUserToAdd: null,
      loader: null,
      verifiedRecordedShow: null,
      openModal: null,
    };
  }

  public async componentDidMount() {
    await this.initPage();
  }

  private async initPage() {
    this.setState({
      isLoading: true,
    });
    await this.fetchProgram();
    await this.fetchAvailableUsers();

    this.setState({
      isLoading: false,
    });
  }

  private async fetchAvailableUsers() {
    const { users } = await this.props.programsStore.getAvailableUsers(
      this.state.program!.id
    );

    return this.setState({
      availableUsers: users,
      isAddMemberOpen: false,
    });
  }

  private async fetchProgram() {
    const program = await this.props.programsStore.fetchById(
      this.props.match.params.id
    );
    this.setState({
      program,
    });
  }

  private renderInfoRow(props: { icon: string; title: string; data: string }) {
    return (
      <Descriptions.Item label={props.title}>{props.data}</Descriptions.Item>
    );
  }
  private renderImage() {
    const { program } = this.state;
    const imageUrl = program?.cover_image || program?.users[0].profile_image;

    const imageStyle: React.CSSProperties = {
      width: "auto",
      maxHeight: "200px",
    };

    return (
      <img
        alt={program?.name_en}
        src={
          "https://res.cloudinary.com/marik-shnitman/image/upload/w_600/v1547932540/" +
          imageUrl
        }
        style={imageStyle}
      />
    );
  }

  private toggleAddCrewMember() {
    this.setState({
      isAddMemberOpen: !this.state.isAddMemberOpen,
    });
  }
  private toggleAddRecordedShow() {
    this.setState({
      AddRecordedShowStatus: this.state.AddRecordedShowStatus
        ? null
        : AddRecordedShowStatuses.VALIDATE,
      verifiedRecordedShow: null,
    });
  }
  private toggleEditTimeModal() {
    this.setState({
      openModal:
        this.state.openModal === SingeProgramPageModals.EDIT_TIMES
          ? null
          : SingeProgramPageModals.EDIT_TIMES,
    });
  }

  private async postRecordedShow(recordedShow: ValidateRecordedShowResponse) {
    this.setState({
      loader: ProgramsLoaderTypes.ADD_RECORDED_SHOW,
    });
    const programId = this.props.match.params.id;
    await this.props.programsStore.createRecordedShow(programId, recordedShow);
    await this.fetchProgram();
    this.setState({
      loader: null,
      AddRecordedShowStatus: null,
    });
  }

  private addRecordedShow() {
    const { AddRecordedShowStatus, verifiedRecordedShow } = this.state;
    if (AddRecordedShowStatus === AddRecordedShowStatuses.VALIDATE) {
      return (
        <ValidateRecordedShow
          isLoading={
            this.state.loader === ProgramsLoaderTypes.ADD_RECORDED_SHOW
          }
          onSubmit={(url) => this.validateRecordedShow(url)}
        />
      );
    }
    if (
      AddRecordedShowStatus === AddRecordedShowStatuses.SUBMIT &&
      verifiedRecordedShow
    ) {
      return (
        <SubmitRecordedShow
          recordedShow={verifiedRecordedShow}
          onSubmit={(verifiedShow) => this.postRecordedShow(verifiedShow)}
          isLoading={
            this.state.loader === ProgramsLoaderTypes.ADD_RECORDED_SHOW
          }
        />
      );
    }
  }

  private renderAddMemberRow() {
    return (
      <Row>
        <AddUserToShowCard
          availableUsers={this.state.availableUsers}
          onCancel={() => {
            this.toggleAddCrewMember();
          }}
          onSave={(userId) => this.onSaveUserToShow(userId)}
        />
      </Row>
    );
  }

  private async onSaveUserToShow(userId: number) {
    await this.props.programsStore.addUserToShow(
      this.props.match.params.id,
      userId
    );

    await this.fetchAvailableUsers();
    await this.fetchProgram();
  }

  private async removeUserFromProgram(id: number) {
    this.setState({
      loader: ProgramsLoaderTypes.REMOVE_USER_FROMM_SHOW,
    });
    await this.props.programsService.removeUserToShow(
      this.state.program!.id,
      id
    );
    this.fetchProgram();
    this.setState({
      loader: null,
    });
  }

  private async validateRecordedShow(url: string) {
    this.setState({
      loader: ProgramsLoaderTypes.ADD_RECORDED_SHOW,
    });

    const recordedShow = await this.props.programsStore.ValidateRecordedShow(
      url
    );

    this.setState({
      loader: null,
      AddRecordedShowStatus: AddRecordedShowStatuses.SUBMIT,
      verifiedRecordedShow: recordedShow!,
    });
  }

  public render() {
    const { program, loader } = this.state;
    const allowRemovingUsers =
      !!program &&
      program.users.length > 1 &&
      loader !== ProgramsLoaderTypes.REMOVE_USER_FROMM_SHOW;
    const programName = program?.name_en || "Single Program";
    return (
      <Page breadcrumbs={["Home", "Programs"]} title={programName}>
        {this.state.program && (
          <React.Fragment>
            <Col span={24}>
              <Card>
                <Space>
                  <div>{this.state.program && this.renderImage()}</div>
                  <Descriptions layout="horizontal">
                    {this.renderInfoRow({
                      icon: "description",
                      title: "Description",
                      data: this.state.program?.description,
                    })}
                    {this.renderInfoRow({
                      icon: "description",
                      title: "When",
                      data: `${moment.weekdays(
                        this.state.program?.programTimes.day_of_week
                      )} - ${this.state.program?.programTimes.start_time}`,
                    })}
                  </Descriptions>
                  <div>
                    <Button
                      type="primary"
                      onClick={() => this.toggleEditTimeModal()}
                    >
                      Edit time
                    </Button>
                  </div>
                </Space>
              </Card>
            </Col>
            {/* Users */}
            <Space direction="vertical" style={{ width: "100%" }}>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col span={24}>
                  <Card
                    title="Crew"
                    extra={
                      <Button
                        type="primary"
                        onClick={() => this.toggleAddCrewMember()}
                      >
                        Add User
                      </Button>
                    }
                  >
                    <div>
                      {this.state.isAddMemberOpen && this.renderAddMemberRow()}
                      <Row>
                        <Col span={24}>
                          <Space>
                            {this.state.program?.users.map((user) => {
                              return (
                                <Tag
                                  closable={allowRemovingUsers}
                                  onClose={() =>
                                    this.removeUserFromProgram(user.id)
                                  }
                                >
                                  {user.name}
                                </Tag>
                              );
                            })}
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Card
                    title="Recorded Shows"
                    extra={
                      <Button
                        type="primary"
                        onClick={() => this.toggleAddRecordedShow()}
                      >
                        Add Recorded Show
                      </Button>
                    }
                  >
                    <div>
                      {this.state.AddRecordedShowStatus &&
                        this.addRecordedShow()}
                      <Row>
                        <Col span={24}>
                          {this.state.program &&
                          this.state.program.recorded_shows.length ? (
                            this.renderRecordedShowsTable()
                          ) : (
                            <NoRecordedShows />
                          )}
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Space>
          </React.Fragment>
        )}
        <EditProgramTimes
          programId={program?.id}
          isOpen={this.state.openModal === SingeProgramPageModals.EDIT_TIMES}
          dayOfWeek={program?.programTimes.day_of_week}
          startTime={program?.programTimes.start_time}
          onClose={() => this.toggleEditTimeModal()}
        />
      </Page>
    );
  }

  private renderRecordedShowContent() {
    const { program } = this.state;

    if (program?.recorded_shows.length) {
      return program?.recorded_shows.map((show) => {
        return (
          <tr key={show.id}>
            <th>{show.id}</th>
            <td>{show.name}</td>
            <td>{show.duration}</td>
            <td>{show.url}</td>
            <td>{show.is_displayed ? "Yes" : "No"}</td>
          </tr>
        );
      });
    }

    return <NoRecordedShows />;
  }

  private renderRecordedShowsTable() {
    return (
      <Table
        columns={columns}
        dataSource={this.state.program?.recorded_shows}
      />
    );
  }
}
