import Component from "@glimmer/component";
import { tracked } from '@glimmer/tracking';
import { inject as controller } from "@ember/controller";
import { action } from "@ember/object";
import User from "discourse/models/user";
import I18n from "discourse-i18n";

export default class BrandOfficialTopics extends Component {
    @controller topic;
    @tracked opTopicPostCount;
    @tracked showOPonly = false;

    constructor() {
        super(...arguments);
        this.topicModel = this.args.outletArgs.model;
        if(settings.show_op_only_button) {
            this.init();
        }
    }

    init() {
        User.findByUsername(
            this.topicModel.details.created_by.username,
            { include_post_count_for: this.topicModel.id }
        ).then((user) => {
            if (user.topic_post_count) {
                this.opTopicPostCount = user.topic_post_count[this.topicModel.id];
                this.opUser = user;
            }
        });
    }

    get buttonTitle() {
        if (!this.showOPonly) {
            return I18n.t(themePrefix("filter_by_op"), {count: this.opTopicPostCount});
        }else {
            return I18n.t(themePrefix("show_all_posts"));
        }
    }

    get buttonClass() {
        return this.showOPonly ? "btn-primary" : "btn-default";
    }

    get shouldShow() {
        return settings.show_op_only_button &&
            this.opTopicPostCount > settings.show_op_only_post_count_threshold;
    }

    @action
    toggleOpPostOnly() {
        if (!this.showOPonly) {
            this.topic.send("filterParticipant", this.opUser);
        } else {
            const postStream = this.topic.model.postStream;
            postStream.cancelFilter();
            postStream.refresh();
        }
        this.showOPonly = !this.showOPonly;
    }
}